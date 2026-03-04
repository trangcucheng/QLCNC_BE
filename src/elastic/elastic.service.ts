import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { ElasticSearchDto, ExportDto } from './dto/elastic.dto';
import { ELASTIC_INDEX } from './elastic.constants';
import { BaoCaoMapping } from './mapping/baoCao.mapping';

@Injectable()
export class ElasticService implements OnModuleInit {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) { }

  async onModuleInit() {
    console.log('Initializing Elasticsearch mappings...');
    await this.createIndexIfNotExist(ELASTIC_INDEX.BAO_CAO, BaoCaoMapping);
  }

  async createIndexIfNotExist(index: string, mapping: any) {
    try {
      const exist = await this.elasticsearchService.indices.exists({ index });

      if (!exist) {
        await this.elasticsearchService.indices.create({
          index,
          body: mapping,
        });
        console.log(`Created Elasticsearch index: ${index}`);
      } else {
        console.log(`Elasticsearch index already exists: ${index}`);
      }
    } catch (error) {
      console.error(`Error creating Elasticsearch index ${index}:`, error);
    }
  }

  async insert(index: string, entity: any, id: any) {
    try {
      await this.elasticsearchService.index({
        index,
        id: id.toString(),
        document: entity,
      });
      console.log(`Inserted document ${id} to ${index}`);
    } catch (error) {
      console.error(`Error inserting document to ${index}:`, error);
    }
  }

  async update(index: string, id: string, data: any) {
    try {
      await this.elasticsearchService.update({
        index,
        id: id.toString(),
        doc: data,
      });
      console.log(`Updated document ${id} in ${index}`);
    } catch (error) {
      console.error(`Error updating document in ${index}:`, error);
    }
  }

  async delete(index: string, id: string) {
    try {
      await this.elasticsearchService.delete({
        index,
        id: id.toString(),
      });
      console.log(`Deleted document ${id} from ${index}`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.warn(`Document ${id} not found in ${index}`);
      } else {
        console.error(`Error deleting document from ${index}:`, error);
      }
    }
  }

  async bulkInsert(index: string, data: any[], getId: (item: any) => string | number) {
    try {
      const body = data.flatMap(doc => [
        { index: { _index: index, _id: getId(doc).toString() } },
        doc
      ]);

      const result = await this.elasticsearchService.bulk({ body, refresh: true });

      if (result.errors) {
        console.error('Bulk insert errors:', result.items);
      } else {
        console.log(`Bulk inserted ${data.length} documents to ${index}`);
      }
    } catch (error) {
      console.error(`Error bulk inserting to ${index}:`, error);
    }
  }

  async indicesIndex(index: string) {
    try {
      await this.elasticsearchService.indices.delete({ index });
      console.log(`Deleted Elasticsearch index: ${index}`);
    } catch (error) {
      console.error(`Error deleting index ${index}:`, error);
    }
  }

  async setMax(index: string, maxResultWindow = 600000) {
    try {
      await this.elasticsearchService.indices.putSettings({
        index,
        body: {
          index: {
            max_result_window: maxResultWindow,
          },
        },
      });
      console.log(`Set max_result_window for ${index} to ${maxResultWindow}`);
    } catch (error) {
      console.error(`Error setting max_result_window for ${index}:`, error);
    }
  }

  async syncIncrementalToElastic<T>(
    indexName: string,
    getDataPage: (skip: number, take: number) => Promise<T[]>,
    getId: (item: T) => string | number,
    transform?: (item: T) => Record<string, any>,
    pageSize = 1000,
  ): Promise<void> {
    let page = 0;

    while (true) {
      const list = await getDataPage(page * pageSize, pageSize);
      console.log(`Syncing page ${page + 1}, skip ${page * pageSize}, take ${pageSize}`);
      
      if (!list.length) break;

      const body = list.flatMap((item) => {
        const doc = transform ? transform(item) : item;
        return [
          { index: { _index: indexName, _id: getId(item).toString() } },
          doc,
        ];
      });

      const result = await this.elasticsearchService.bulk({ body });

      if (result.errors) {
        console.error('Sync errors:', result.items);
      }

      page++;
    }

    console.log(`Sync to Elasticsearch index [${indexName}] done!`);
  }

  async searchElasticTable(
    index: string,
    dto: ElasticSearchDto,
    searchFields: string[],
    sortField = 'baoCao_id',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    data: Record<string, any>[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { search, page = 1, limit = 10, filters, sortField: customSortField, sortOrder: customSortOrder } = dto;
    const from = (page - 1) * limit;
    const mustQuery: any[] = [];

    // Search text
    if (search) {
      mustQuery.push({
        multi_match: {
          query: search,
          fields: searchFields,
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Apply filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          // Handle array filters (multiple values)
          if (Array.isArray(filters[key])) {
            mustQuery.push({
              terms: { [key]: filters[key] },
            });
          } else {
            mustQuery.push({
              term: { [key]: filters[key] },
            });
          }
        }
      });
    }

    const finalSortField = customSortField || sortField;
    const finalSortOrder = customSortOrder || sortOrder;

    try {
      const result = await this.elasticsearchService.search({
        index,
        from,
        size: limit,
        track_total_hits: true,
        query: {
          bool: {
            must: mustQuery.length > 0 ? mustQuery : [{ match_all: {} }],
          },
        },
        sort: [
          {
            [finalSortField]: {
              order: finalSortOrder,
            },
          },
        ],
      });

      const data = result.hits.hits.map((hit) => ({
        _id: hit._id,
        ...(hit._source as Record<string, any>),
      }));

      const total = typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error searching Elasticsearch:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }
  }

  async dataExport(
    index: string,
    dto: ExportDto,
    sortField = 'baoCao_id',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    data: Record<string, any>[];
    meta: { total: number };
  }> {
    const { search, filters, sortField: customSortField, sortOrder: customSortOrder } = dto;
    const mustQuery: any[] = [];

    // Search text
    if (search) {
      mustQuery.push({
        multi_match: {
          query: search,
          fields: ['*'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Apply filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (Array.isArray(filters[key])) {
            mustQuery.push({
              terms: { [key]: filters[key] },
            });
          } else {
            mustQuery.push({
              term: { [key]: filters[key] },
            });
          }
        }
      });
    }

    const finalSortField = customSortField || sortField;
    const finalSortOrder = customSortOrder || sortOrder;

    try {
      // Use scroll API for large exports
      const scrollTimeout = '2m';
      const allHits: any[] = [];

      const result = await this.elasticsearchService.search({
        index,
        scroll: scrollTimeout,
        size: 10000,
        query: {
          bool: {
            must: mustQuery.length > 0 ? mustQuery : [{ match_all: {} }],
          },
        },
        sort: [
          {
            [finalSortField]: {
              order: finalSortOrder,
            },
          },
        ],
      });

      let scrollId = result._scroll_id;
      allHits.push(...result.hits.hits);

      while (result.hits.hits.length > 0) {
        const scrollResult = await this.elasticsearchService.scroll({
          scroll_id: scrollId,
          scroll: scrollTimeout,
        });

        if (!scrollResult.hits.hits.length) break;

        allHits.push(...scrollResult.hits.hits);
        scrollId = scrollResult._scroll_id;
      }

      // Clear scroll
      if (scrollId) {
        await this.elasticsearchService.clearScroll({ scroll_id: scrollId });
      }

      const data = allHits.map((hit) => ({
        _id: hit._id,
        ...(hit._source as Record<string, any>),
      }));

      return {
        data,
        meta: {
          total: data.length,
        },
      };
    } catch (error) {
      console.error('Error exporting data from Elasticsearch:', error);
      return {
        data: [],
        meta: {
          total: 0,
        },
      };
    }
  }
}

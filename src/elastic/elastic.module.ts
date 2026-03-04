import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BaoCaoDoanSoTheoKyRepository } from '../HeThong/bao-cao-doan-so-theo-ky/bao-cao-doan-so-theo-ky.repository';
import { ElasticService } from './elastic.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    }),
    TypeOrmModule.forFeature([
      BaoCaoDoanSoTheoKyRepository
    ])
  ],
  providers: [ElasticService],
  exports: [ElasticService],
})
export class ElasticModule { }

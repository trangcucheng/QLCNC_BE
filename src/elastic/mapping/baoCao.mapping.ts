export const BaoCaoMapping = {
  mappings: {
    properties: {
      // Báo cáo fields
      baoCao_id: { type: 'integer' },
      baoCao_tenBaoCao: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'standard',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          },
          raw: {
            type: 'text',
            analyzer: 'standard'
          }
        }
      },
      baoCao_thoiGianCapNhatDoanSoId: { type: 'integer' },
      baoCao_nguoiBaoCaoId: { type: 'keyword' },
      baoCao_organizationId: { type: 'integer' },
      baoCao_xaPhuongId: { type: 'integer' },
      baoCao_cumKhuCnId: { type: 'integer' },
      baoCao_soLuongDoanVienNam: { type: 'integer' },
      baoCao_soLuongDoanVienNu: { type: 'integer' },
      baoCao_soLuongCNVCLDNam: { type: 'integer' },
      baoCao_soLuongCNVCLDNu: { type: 'integer' },
      baoCao_tongSoCongDoan: { type: 'integer' },
      baoCao_tongSoCnvcld: { type: 'integer' },
      baoCao_noiDung: {
        type: 'text',
        analyzer: 'vietnamese_analyzer'
      },
      baoCao_loaiBaoCao: { type: 'keyword' },
      baoCao_trangThaiPheDuyet: { type: 'keyword' },
      baoCao_ghiChu: {
        type: 'text',
        analyzer: 'vietnamese_analyzer'
      },
      baoCao_createdAt: {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis'
      },
      baoCao_updatedAt: {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis'
      },

      // Thời gian cập nhật đoàn số fields
      thoiGian_id: { type: 'integer' },
      thoiGian_ten: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          }
        }
      },
      thoiGian_loaiKy: { type: 'keyword' },
      thoiGian_thoiGianBatDau: {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis'
      },
      thoiGian_thoiGianKetThuc: {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis'
      },
      thoiGian_moTa: {
        type: 'text',
        analyzer: 'vietnamese_analyzer'
      },

      // Người báo cáo fields
      nguoiBaoCao_id: { type: 'keyword' },
      nguoiBaoCao_fullName: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          }
        }
      },
      nguoiBaoCao_email: { type: 'keyword' },

      // Organization fields
      organization_id: { type: 'integer' },
      organization_name: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'standard',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          },
          raw: {
            type: 'text',
            analyzer: 'standard'
          }
        }
      }
    }
  },
  settings: {
    number_of_shards: 1,
    number_of_replicas: 1,
    analysis: {
      analyzer: {
        vietnamese_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding']
        },
        vietnamese_search_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'edge_ngram_filter']
        }
      },
      filter: {
        edge_ngram_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20
        }
      }
    }
  }
};

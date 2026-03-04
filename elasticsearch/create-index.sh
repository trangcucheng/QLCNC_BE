#!/bin/bash

# Script để tạo index và mapping cho bảng báo cáo đoàn số theo kỳ trong Elasticsearch

ES_HOST="http://localhost:9200"
INDEX_NAME="bao_cao_doan_so_theo_ky"

echo "Đang kiểm tra kết nối đến Elasticsearch..."
until curl -s "$ES_HOST" > /dev/null; do
  echo "Đang chờ Elasticsearch khởi động..."
  sleep 5
done

echo "Elasticsearch đã sẵn sàng!"

# Xóa index cũ nếu tồn tại (tùy chọn - comment dòng này nếu muốn giữ lại data)
echo "Xóa index cũ (nếu có)..."
curl -X DELETE "$ES_HOST/$INDEX_NAME?ignore_unavailable=true"

echo ""
echo "Tạo index mới với mapping..."

# Tạo index với mapping chi tiết
curl -X PUT "$ES_HOST/$INDEX_NAME" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "vietnamese_analyzer": {
          "type": "standard"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "integer"
      },
      "tenBaoCao": {
        "type": "text",
        "analyzer": "vietnamese_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "loaiBaoCao": {
        "type": "keyword"
      },
      "thoiGianCapNhatDoanSoId": {
        "type": "integer"
      },
      "nguoiBaoCaoId": {
        "type": "keyword"
      },
      "organizationId": {
        "type": "integer"
      },
      "xaPhuongId": {
        "type": "integer"
      },
      "cumKhuCnId": {
        "type": "integer"
      },
      "soLuongDoanVienNam": {
        "type": "integer"
      },
      "soLuongDoanVienNu": {
        "type": "integer"
      },
      "soLuongCNVCLDNam": {
        "type": "integer"
      },
      "soLuongCNVCLDNu": {
        "type": "integer"
      },
      "tongSoCongDoan": {
        "type": "integer"
      },
      "tongSoCnvcld": {
        "type": "integer"
      },
      "noiDung": {
        "type": "text",
        "analyzer": "vietnamese_analyzer"
      },
      "trangThaiPheDuyet": {
        "type": "keyword"
      },
      "ghiChu": {
        "type": "text",
        "analyzer": "vietnamese_analyzer"
      },
      "nguoiPheDuyetId": {
        "type": "keyword"
      },
      "ngayPheDuyet": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "createdAt": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "updatedAt": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "thoiGian": {
        "properties": {
          "id": {
            "type": "integer"
          },
          "ten": {
            "type": "text",
            "analyzer": "vietnamese_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword"
              }
            }
          },
          "thoiGianBatDau": {
            "type": "date",
            "format": "strict_date_optional_time||epoch_millis"
          },
          "thoiGianKetThuc": {
            "type": "date",
            "format": "strict_date_optional_time||epoch_millis"
          },
          "moTa": {
            "type": "text",
            "analyzer": "vietnamese_analyzer"
          },
          "loaiKy": {
            "type": "keyword"
          }
        }
      },
      "nguoiBaoCao": {
        "properties": {
          "id": {
            "type": "keyword"
          },
          "fullName": {
            "type": "text",
            "analyzer": "vietnamese_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword"
              }
            }
          },
          "email": {
            "type": "keyword"
          }
        }
      },
      "organization": {
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "text",
            "analyzer": "vietnamese_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword"
              }
            }
          }
        }
      }
    }
  }
}
'

echo ""
echo "Index đã được tạo thành công!"
echo "Bạn có thể truy cập Kibana tại: http://localhost:5601"
echo "Elasticsearch API: $ES_HOST"
echo "Index name: $INDEX_NAME"

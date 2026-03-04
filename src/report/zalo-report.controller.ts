import { Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/HeThong/auth/guards/flexible-auth.guard';

import { ThongKeRequestDto } from './dto/thong-ke.dto';
import { ReportService } from './report.service';

@ApiTags('Zalo Mini App - Report')
@Controller('zalo/report')
export class ZaloReportController {
  constructor(private readonly ReportService: ReportService) { }

  // ==================== THỐNG KÊ APIs cho Zalo Mini App ====================

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-tong-quan')
  @ApiOperation({
    summary: '[Zalo] Thống kê tổng quan dashboard',
    description: 'API lấy thống kê tổng quan cho Zalo Mini App: tổng số công đoàn, đoàn viên, sự kiện trong tháng, báo cáo chờ phê duyệt và tỷ lệ tăng trưởng'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    schema: {
      example: {
        success: true,
        message: 'Lấy thống kê tổng quan thành công',
        data: {
          totalOrganizations: 15,
          totalMembers: 1250,
          eventsThisMonth: 8,
          pendingReports: 3,
          growthRate: {
            members: 5.2,
            organizations: 2.1,
            events: 12.5
          },
          monthlyComparison: {
            currentMonth: {
              members: 1250,
              organizations: 15,
              events: 8
            },
            previousMonth: {
              members: 1186,
              organizations: 14,
              events: 7
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @HttpCode(HttpStatus.OK)
  async getThongKeTongQuan(@Req() req: any, @Query(ValidationPipe) queryDto: ThongKeRequestDto) {
    const result = await this.ReportService.getThongKeTongQuan(req.user.id, queryDto);

    return {
      success: true,
      message: 'Lấy thống kê tổng quan thành công',
      data: result
    };
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-chi-tiet')
  @ApiOperation({
    summary: '[Zalo] Thống kê chi tiết',
    description: 'API lấy thống kê chi tiết cho Zalo Mini App theo tổ chức, thời gian và trạng thái báo cáo'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê chi tiết thành công',
    schema: {
      example: {
        success: true,
        message: 'Lấy thống kê chi tiết thành công',
        data: {
          organizationStats: [
            {
              organizationId: 1,
              organizationName: 'Công đoàn ABC',
              totalMembers: 150,
              maleMembers: 85,
              femaleMembers: 65,
              reportStatus: 'approved'
            }
          ],
          summary: {
            totalOrganizations: 5,
            totalReports: 12,
            approvedReports: 8,
            pendingReports: 3,
            rejectedReports: 1
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @HttpCode(HttpStatus.OK)
  async getThongKeChiTiet(@Query(ValidationPipe) queryDto: ThongKeRequestDto) {
    const result = await this.ReportService.getThongKeChiTiet(queryDto);

    return {
      success: true,
      message: 'Lấy thống kê chi tiết thành công',
      data: result
    };
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-doan-vien')
  @ApiOperation({
    summary: '[Zalo] Thống kê số lượng đoàn viên nam/nữ',
    description: 'API thống kê số lượng đoàn viên nam và nữ cho Zalo Mini App theo cụm khu công nghiệp, xã phường và tổ chức của user hiện tại'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê đoàn viên thành công',
    schema: {
      example: {
        success: true,
        message: 'Lấy thống kê đoàn viên thành công',
        data: {
          userInfo: {
            userId: 'user123',
            organizationId: 1,
            cumKhuCnId: 2,
            xaPhuongId: 3,
            organizationName: 'Công đoàn ABC'
          },
          statistics: {
            soLuongDoanVienNam: 150,
            soLuongDoanVienNu: 120,
            tongSoLuongDoanVien: 270,
            tiLePhanTram: {
              nam: 55.6,
              nu: 44.4
            }
          },
          filterInfo: {
            cumKhuCongNghiep: 'Cụm KCN Đông Nam',
            xaPhuong: 'Xã Tân Phú',
            organization: 'Công đoàn ABC'
          },
          chartData: [
            { label: 'Đoàn viên Nam', value: 150, color: '#3B82F6' },
            { label: 'Đoàn viên Nữ', value: 120, color: '#EC4899' }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Không tìm thấy thông tin user hoặc tổ chức'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @HttpCode(HttpStatus.OK)
  async getThongKeDoanVien(@Req() req: any) {
    const result = await this.ReportService.getThongKeDoanVien(req.user.id);

    // Enhance result for mobile app
    const statistics = result.data.statistics;
    const total = statistics.tongSoLuongDoanVien;

    const enhancedResult = {
      ...result,
      data: {
        ...result.data,
        statistics: {
          ...statistics,
          tiLePhanTram: {
            nam: total > 0 ? Math.round((statistics.soLuongDoanVienNam / total) * 100 * 10) / 10 : 0,
            nu: total > 0 ? Math.round((statistics.soLuongDoanVienNu / total) * 100 * 10) / 10 : 0
          }
        },
        chartData: [
          {
            label: 'Đoàn viên Nam',
            value: statistics.soLuongDoanVienNam,
            color: '#3B82F6'
          },
          {
            label: 'Đoàn viên Nữ',
            value: statistics.soLuongDoanVienNu,
            color: '#EC4899'
          }
        ]
      }
    };

    return enhancedResult;
  }

  // ==================== APIs bổ sung cho Mobile ====================

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('dashboard-summary')
  @ApiOperation({
    summary: '[Zalo] Tổng quan dashboard mobile',
    description: 'API lấy tổng quan dashboard tối ưu cho Zalo Mini App với các thông số chính'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy tổng quan dashboard thành công',
    schema: {
      example: {
        success: true,
        message: 'Lấy tổng quan dashboard thành công',
        data: {
          quickStats: {
            totalMembers: 1250,
            totalOrganizations: 15,
            pendingReports: 3,
            eventsThisMonth: 8
          },
          userOrganization: {
            id: 1,
            name: 'Công đoàn ABC',
            memberCount: 150,
            hasActivePeriod: true,
            lastReportDate: '2024-09-15'
          },
          recentActivities: [
            {
              type: 'report_created',
              message: 'Báo cáo Q3/2024 đã được tạo',
              timestamp: '2024-09-20T10:30:00Z',
              icon: '📊'
            },
            {
              type: 'report_approved',
              message: 'Báo cáo Q2/2024 đã được phê duyệt',
              timestamp: '2024-09-18T14:15:00Z',
              icon: '✅'
            }
          ],
          alerts: [
            {
              type: 'warning',
              message: 'Còn 5 ngày để nộp báo cáo Q3/2024',
              priority: 'high',
              action: 'create_report'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @HttpCode(HttpStatus.OK)
  async getDashboardSummary(@Req() req: any) {
    // TODO: Implement dashboard summary logic
    return {
      success: true,
      message: 'Lấy tổng quan dashboard thành công',
      data: {
        quickStats: {
          totalMembers: 1250,
          totalOrganizations: 15,
          pendingReports: 3,
          eventsThisMonth: 8
        },
        userOrganization: {
          id: req.user.organizationId || 0,
          name: 'Tổ chức của bạn',
          memberCount: 150,
          hasActivePeriod: true,
          lastReportDate: new Date().toISOString().split('T')[0]
        },
        recentActivities: [
          {
            type: 'report_created',
            message: 'Chào mừng bạn đến với hệ thống quản lý công đoàn',
            timestamp: new Date().toISOString(),
            icon: '👋'
          }
        ],
        alerts: []
      }
    };
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('chart-data')
  @ApiOperation({
    summary: '[Zalo] Dữ liệu biểu đồ',
    description: 'API lấy dữ liệu biểu đồ tối ưu cho Zalo Mini App'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy dữ liệu biểu đồ thành công',
    schema: {
      example: {
        success: true,
        message: 'Lấy dữ liệu biểu đồ thành công',
        data: {
          membersByGender: {
            labels: ['Nam', 'Nữ'],
            data: [150, 120],
            colors: ['#3B82F6', '#EC4899']
          },
          membersByOrganization: {
            labels: ['Công đoàn A', 'Công đoàn B', 'Công đoàn C'],
            data: [45, 65, 40],
            colors: ['#10B981', '#F59E0B', '#EF4444']
          },
          reportsByStatus: {
            labels: ['Đã phê duyệt', 'Chờ phê duyệt', 'Từ chối'],
            data: [8, 3, 1],
            colors: ['#10B981', '#F59E0B', '#EF4444']
          },
          monthlyTrends: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [
              {
                label: 'Số đoàn viên',
                data: [1100, 1150, 1180, 1200, 1220, 1250],
                color: '#3B82F6'
              },
              {
                label: 'Số báo cáo',
                data: [5, 6, 7, 8, 9, 12],
                color: '#10B981'
              }
            ]
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @HttpCode(HttpStatus.OK)
  async getChartData(@Req() req: any) {
    const memberStats = await this.ReportService.getThongKeDoanVien(req.user.id);

    const membersByGender = {
      labels: ['Nam', 'Nữ'],
      data: [
        memberStats.data.statistics.soLuongDoanVienNam,
        memberStats.data.statistics.soLuongDoanVienNu
      ],
      colors: ['#3B82F6', '#EC4899']
    };

    return {
      success: true,
      message: 'Lấy dữ liệu biểu đồ thành công',
      data: {
        membersByGender,
        membersByOrganization: {
          labels: [memberStats.data.userInfo.organizationName],
          data: [memberStats.data.statistics.tongSoLuongDoanVien],
          colors: ['#10B981']
        },
        reportsByStatus: {
          labels: ['Đã phê duyệt', 'Chờ phê duyệt', 'Từ chối'],
          data: [8, 3, 1],
          colors: ['#10B981', '#F59E0B', '#EF4444']
        },
        monthlyTrends: {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
          datasets: [
            {
              label: 'Số đoàn viên',
              data: [1100, 1150, 1180, 1200, 1220, memberStats.data.statistics.tongSoLuongDoanVien],
              color: '#3B82F6'
            }
          ]
        }
      }
    };
  }

  // ==================== XUẤT BÁO CÁO (Không khả dụng trên mobile) ====================

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('export-info')
  @ApiOperation({
    summary: '[Zalo] Thông tin xuất báo cáo',
    description: 'API lấy thông tin về khả năng xuất báo cáo (thông báo không khả dụng trên mobile)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin xuất báo cáo thành công',
    schema: {
      example: {
        success: true,
        message: 'Chức năng xuất báo cáo không khả dụng trên mobile',
        data: {
          available: false,
          reason: 'Tính năng xuất file Excel chỉ khả dụng trên web',
          webUrl: 'https://your-domain.com/report/export-bao-cao-cdcs',
          alternativeActions: [
            {
              title: 'Xem báo cáo trực tuyến',
              description: 'Xem thống kê và báo cáo trực tiếp trên ứng dụng',
              action: 'view_online_report'
            },
            {
              title: 'Truy cập web',
              description: 'Sử dụng trình duyệt để tải xuống file Excel',
              action: 'open_web_browser'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @HttpCode(HttpStatus.OK)
  async getExportInfo() {
    return {
      success: true,
      message: 'Chức năng xuất báo cáo không khả dụng trên mobile',
      data: {
        available: false,
        reason: 'Tính năng xuất file Excel chỉ khả dụng trên web',
        webUrl: process.env.WEB_URL + '/report/export-bao-cao-cdcs',
        alternativeActions: [
          {
            title: 'Xem báo cáo trực tuyến',
            description: 'Xem thống kê và báo cáo trực tiếp trên ứng dụng',
            action: 'view_online_report'
          },
          {
            title: 'Truy cập web',
            description: 'Sử dụng trình duyệt để tải xuống file Excel',
            action: 'open_web_browser'
          }
        ]
      }
    };
  }
}

import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Booking } from 'src/app/models/booking';
import { Hour, Hours } from 'src/app/models/hour';
import { BookingService } from 'src/app/services/booking.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-today-schedule-list',
  templateUrl: './today-schedule-list.component.html',
  styleUrls: ['./today-schedule.component.scss']
})
export class TodayScheduleListComponent implements OnInit, OnDestroy {
  
  bookings: Booking[] = [];
  loading = false;
  
  // DataTable properties
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  isDtInitialized = false;
  
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  
  // Hours mapping
  hours: Hour[] = Hours.map((name, index) => ({
    id: index + 1,
    name: name,
    session: index < 4 ? 'Sáng' : (index < 6 ? 'Chiều' : 'Tối'),
    startTime: name.split(' - ')[0],
    endTime: name.split(' - ')[1]
  }));

  constructor(
    private bookingService: BookingService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeDataTable();
    this.loadTodayBookings();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  initializeDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: true,
      retrieve: true,
      processing: true,
      serverSide: false,
      language: {
        "decimal": "",
        "emptyTable": "Không có dữ liệu trong bảng",
        "info": "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
        "infoEmpty": "Hiển thị 0 đến 0 của 0 mục",
        "infoFiltered": "(lọc từ _MAX_ tổng số mục)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Hiển thị _MENU_ mục",
        "loadingRecords": "Đang tải...",
        "processing": "Đang xử lý...",
        "search": "Tìm kiếm:",
        "zeroRecords": "Không tìm thấy kết quả nào",
        "paginate": {
          "first": "Đầu",
          "last": "Cuối",
          "next": "Tiếp",
          "previous": "Trước"
        },
        "aria": {
          "sortAscending": ": kích hoạt để sắp xếp cột tăng dần",
          "sortDescending": ": kích hoạt để sắp xếp cột giảm dần"
        }
      },
      columnDefs: [
        { orderable: false, targets: [4] }, // Disable sorting on action column
        { width: '8%', targets: 0 },   // STT
        { width: '15%', targets: 1 },  // Ngày khám
        { width: '12%', targets: 2 },  // Giờ khám
        { width: '50%', targets: 3 },  // Thông tin bệnh nhân
        { width: '15%', targets: 4 }   // Hành động
      ]
    };
  }

  loadTodayBookings() {
    this.loading = true;
    const doctorId = storageUtils.get('userId');
    const today = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    
    this.bookingService.getAllBooking('ACCEPTING', doctorId, today, today, null)
      .subscribe({
        next: (bookings: Booking[]) => {
          this.bookings = bookings;
          this.loading = false;
          this.reinitializeDataTable();
        },
        error: (error) => {
          console.error('Error loading today bookings:', error);
          this.toastr.error('Có lỗi xảy ra khi tải lịch khám hôm nay');
          this.loading = false;
        }
      });
  }

  private reinitializeDataTable() {
    if (this.isDtInitialized && this.dtElement?.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        try {
          dtInstance.destroy();
          this.isDtInitialized = false;
          setTimeout(() => {
            this.dtTrigger.next(null);
            this.isDtInitialized = true;
          }, 200);
        } catch (error) {
          console.error('Error destroying DataTable:', error);
          this.isDtInitialized = false;
          setTimeout(() => {
            this.dtTrigger.next(null);
            this.isDtInitialized = true;
          }, 200);
        }
      }).catch(error => {
        console.error('Error getting DataTable instance:', error);
        this.isDtInitialized = false;
        setTimeout(() => {
          this.dtTrigger.next(null);
          this.isDtInitialized = true;
        }, 200);
      });
    } else {
      setTimeout(() => {
        this.dtTrigger.next(null);
        this.isDtInitialized = true;
      }, 200);
    }
  }

  refreshData() {
    this.loadTodayBookings();
  }

  startExamination(bookingId: number) {
    this.router.navigate(['/doctor/examination', bookingId]);
  }

  viewBookingInfo(booking: Booking) {
    this.toastr.info('Chức năng xem thông tin đang được phát triển');
  }

  getHourText(hourId: number): string {
    const hour = this.hours.find(h => h.id === hourId);
    return hour ? hour.name : 'Không xác định';
  }

  getGenderText(gender: string): string {
    return gender === 'MALE' ? 'Nam' : 'Nữ';
  }

  formatDate(date: string): string {
    if (!date) return '';
    try {
      let dateObj: Date;
      if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        dateObj = new Date(date);
      }
      return dateObj.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  }

  trackByFn(index: number, booking: Booking): number {
    return booking.id;
  }
} 
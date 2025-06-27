import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Booking } from 'src/app/models/booking';
import { Hour, Hours } from 'src/app/models/hour';
import { BookingService } from 'src/app/services/booking.service';
import { ExaminationService } from 'src/app/services/examination.service';
import { ExaminationDetailsResponse } from 'src/app/models/examination.dto';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-completed-examinations',
  templateUrl: './completed-examinations.component.html',
  styleUrls: ['./completed-examinations.component.scss']
})
export class CompletedExaminationsComponent implements OnInit, OnDestroy {
  
  bookings: Booking[] = [];
  loading = false;
  selectedBooking: Booking | null = null; // For modal
  examinationDetails: ExaminationDetailsResponse | null = null;
  loadingDetails = false;
  
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
    private examinationService: ExaminationService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeDataTable();
    this.loadBookings();
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
        { orderable: false, targets: [8, 9] },
        { width: '5%', targets: 0 },
        { width: '15%', targets: 1 },
        { width: '8%', targets: 2 },
        { width: '10%', targets: 3 },
        { width: '10%', targets: 4 },
        { width: '10%', targets: 5 },
        { width: '12%', targets: 6 },
        { width: '10%', targets: 7 },
        { width: '10%', targets: 8 },
        { width: '10%', targets: 9 }
      ]
    };
  }

  loadBookings() {
    this.loading = true;
    const doctorId = storageUtils.get('userId');
    
    this.bookingService.getAllBooking('SUCCESS', doctorId, null, null, null)
      .subscribe({
        next: (bookings: Booking[]) => {
          this.bookings = bookings;
          this.loading = false;
          this.reinitializeDataTable();
        },
        error: (error) => {
          console.error('Error loading completed bookings:', error);
          this.toastr.error('Có lỗi xảy ra khi tải danh sách lịch đã hoàn thành');
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
    this.loadBookings();
  }

  viewBookingInfo(booking: Booking) {
    this.selectedBooking = booking;
    this.loadExaminationDetails(booking.id);
  }

  // Hàm mới để lấy chi tiết examination
  loadExaminationDetails(bookingId: number) {
    this.loadingDetails = true;
    this.examinationDetails = null;
    
    this.examinationService.getExaminationDetails(bookingId).subscribe({
      next: (details) => {
        this.examinationDetails = details;  
        this.loadingDetails = false;
        console.log('Examination details loaded:', details);
      },
      error: (error) => {
        console.error('Error loading examination details:', error);
        this.toastr.warning('Không thể tải chi tiết phiên khám. Hiển thị thông tin cơ bản.');
        this.loadingDetails = false;
        // Vẫn hiển thị modal với thông tin cơ bản từ booking
        this.examinationDetails = this.createBasicDetails();
      }
    });
  }

  // Tạo thông tin cơ bản từ booking nếu không lấy được chi tiết
  private createBasicDetails(): ExaminationDetailsResponse {
    if (!this.selectedBooking) {
      console.error('No selected booking available for createBasicDetails');
      // Return empty structure instead of throwing error
      return {
        historyId: 0,
        booking: {
          id: 0,
          name: 'Không có thông tin',
          email: '',
          phone: '',
          gender: 'MALE',
          dob: '',
          date: '',
          hourId: 0,
          status: 'SUCCESS'
        },
        serviceRequests: [],
        prescriptions: [],
        paymentInfo: {
          totalAmount: 0,
          consultationFee: 200000,
          servicesFee: 0,
          medicinesFee: 0,
          paymentMethod: 'CASH',
          paymentStatus: 'PAID'
        }
      };
    }

    return {
      historyId: this.selectedBooking.id, // Use booking id as fallback
      booking: {
        id: this.selectedBooking.id,
        name: this.selectedBooking.name || 'Không có tên',
        email: this.selectedBooking.email || '',
        phone: this.selectedBooking.phone || '',
        gender: this.selectedBooking.gender || 'MALE',
        dob: this.selectedBooking.dob || '',
        date: this.selectedBooking.date || '',
        hourId: this.selectedBooking.idHour || 0,
        hourName: this.getHourText(this.selectedBooking.idHour || 0),
        status: this.selectedBooking.status || 'SUCCESS',
        totalAmount: this.selectedBooking.totalMoney || 0,
        roomNumber: 'P001', // Default room
        initialSymptoms: 'Không có thông tin',
        doctorNotes: 'Không có thông tin',
        major: 'Không có thông tin',
        doctorName: 'Không có thông tin'
      },
      serviceRequests: [],
      prescriptions: [],
      paymentInfo: {
        totalAmount: this.selectedBooking.totalMoney || 0,
        consultationFee: 200000, // Fee mặc định
        servicesFee: 0,
        medicinesFee: 0,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID'
      }
    };
  }

  // Đóng modal chi tiết
  closeDetailsModal() {
    this.selectedBooking = null;
    this.examinationDetails = null;
    this.loadingDetails = false;
  }

  exportReport(booking: Booking) {
    this.toastr.info('Chức năng xuất báo cáo đang được phát triển');
  }

  // Legacy methods for modal (if needed)
  get itemout() {
    return this.selectedBooking;
  }

  xem(booking: Booking) {
    this.selectedBooking = booking;
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('vi-VN');
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return dateTime;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-success';
      case 'COMPLETED':
        return 'bg-info';
      case 'PAID':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  trackByFn(index: number, booking: Booking): number {
    return booking.id;
  }
}

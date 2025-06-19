import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from 'src/app/services/booking.service';
import { ServiceRequestService, ServiceRequestModel } from 'src/app/services/service-request.service';
import { HistoryService } from 'src/app/services/history.service';
import { Booking } from 'src/app/models/booking';
import { storageUtils } from 'src/app/utils/storage';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-awaiting-results',
  templateUrl: './awaiting-results.component.html',
  styleUrls: ['./awaiting-results.component.scss']
})
export class AwaitingResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  bookings: Booking[] = [];
  loading = false;
  selectedBooking: Booking | null = null;
  serviceRequests: ServiceRequestModel[] = [];
  
  // DataTable configuration
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  isDtInitialized = false;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private serviceRequestService: ServiceRequestService,
    private historyService: HistoryService,
    private toastr: ToastrService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.initializeDataTable();
    this.loadAwaitingResultsBookings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.dtTrigger.unsubscribe();
  }

  private initializeDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Vietnamese.json'
      },
      columnDefs: [
        { orderable: false, targets: -1 } // Disable ordering on last column (actions)
      ],
      order: [[0, 'desc']] // Sort by first column (ID) descending
    };
  }

  private loadAwaitingResultsBookings() {
    this.loading = true;
    const doctorId = storageUtils.get('userId');
    
    if (!doctorId) {
      this.toastService.showError('Không tìm thấy thông tin bác sĩ');
      this.loading = false;
      return;
    }

    this.bookingService.getAwaitingResultsBookings(doctorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings;
          this.loading = false;
          this.reloadDataTable();
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách chờ kết quả:', error);
          this.toastService.showError('Không thể tải danh sách bệnh nhân chờ kết quả');
          this.loading = false;
        }
      });
  }

  private reloadDataTable() {
    if (this.isDtInitialized) {
      this.dtTrigger.next(null);
    } else {
      this.isDtInitialized = true;
      setTimeout(() => {
        this.dtTrigger.next(null);
      }, 100);
    }
  }

  viewServiceRequests(booking: Booking) {
    this.selectedBooking = booking;
    this.loadServiceRequests(booking.id);
  }

  private loadServiceRequests(bookingId: number) {
    this.serviceRequestService.getAllServiceRequestsByBookingId(bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.serviceRequests = requests;
        },
        error: (error) => {
          console.error('Lỗi khi tải service requests:', error);
          this.toastService.showError('Không thể tải danh sách dịch vụ');
        }
      });
  }

  completeServiceRequest(serviceRequest: ServiceRequestModel) {
    console.log("serviceRequest", serviceRequest);
    if (!serviceRequest.resultNotes || serviceRequest.resultNotes.trim() === '') {
      this.toastService.showWarning('Vui lòng nhập kết quả trước khi hoàn thành');
      return;
    }

    this.serviceRequestService.completeServiceRequest(serviceRequest.id, serviceRequest.resultNotes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRequest) => {
          this.toastService.showSuccess('Đã cập nhật kết quả dịch vụ');
          
          // Update local data instead of reloading from server
          const index = this.serviceRequests.findIndex(sr => sr.id === serviceRequest.id);
          if (index !== -1) {
            this.serviceRequests[index] = { ...this.serviceRequests[index], ...updatedRequest };
          }
          
          this.checkAndCompleteBooking();
        },
        error: (error) => {
          console.error('Lỗi khi hoàn thành service request:', error);
          this.toastService.showError('Không thể cập nhật kết quả dịch vụ');
        }
      });
  }

  private checkAndCompleteBooking() {
    if (!this.selectedBooking) return;

    // Check local data instead of making API call
    const allCompleted = this.serviceRequests.length > 0 && 
                        this.serviceRequests.every(sr => sr.status === 'COMPLETED');
    
    if (allCompleted) {
      this.showPrescriptionOption();
    }
  }

  private showPrescriptionOption() {
    if (confirm('Tất cả dịch vụ đã hoàn thành. Bạn có muốn chuyển đến trang kê đơn thuốc không?')) {
      this.proceedToPrescription(this.selectedBooking!);
    }
  }

  viewHistory(booking: Booking) {
    this.historyService.getHistoryByBookingId(booking.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          // Open history detail modal or navigate to history page
          console.log('History:', history);
          this.toastService.showInfo('Xem chi tiết lịch sử khám bệnh');
        },
        error: (error) => {
          console.error('Lỗi khi tải lịch sử:', error);
          this.toastService.showError('Không thể tải lịch sử khám bệnh');
        }
      });
  }

  downloadHistoryPDF(booking: Booking) {
    this.historyService.downloadHistoryPDF(booking.id, `Ket_qua_kham_benh_${booking.name}_${booking.id}.pdf`);
    this.toastService.showSuccess('Đang tải file PDF...');
  }

  // Helper methods for template
  getCompletedCount(): number {
    return this.serviceRequests.filter(r => r.status === 'COMPLETED').length;
  }

  isAllServiceRequestsCompleted(): boolean {
    return this.serviceRequests.length > 0 && this.serviceRequests.every(r => r.status === 'COMPLETED');
  }

  formatCurrency(amount: number): string {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatDateTime(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
  }

  getServiceStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'badge-warning',
      'IN_PROGRESS': 'badge-info',
      'COMPLETED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  }

  getServiceStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'Đã yêu cầu',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  refreshData() {
    this.loadAwaitingResultsBookings();
    this.toastService.showInfo('Đã làm mới dữ liệu');
  }

  proceedToPrescription(booking: Booking) {
    // Close any open Bootstrap modals first
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());
    
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      modal.classList.remove('show');
      (modal as HTMLElement).style.display = 'none';
    });
    
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Navigate to examination component with PRESCRIPTION step
    this.router.navigate(['/doctor/examination', booking.id], {
      queryParams: { step: 'PRESCRIPTION' }
    });
    this.toastService.showInfo('Chuyển đến trang kê đơn thuốc...');
  }
} 
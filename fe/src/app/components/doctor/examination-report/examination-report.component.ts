import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExaminationService } from '../../../services/examination.service';
import { ReportService } from '../../../services/report.service';
import { PaymentService } from '../../../services/payment.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-examination-report',
  templateUrl: './examination-report.component.html',
  styleUrls: ['./examination-report.component.css']
})
export class ExaminationReportComponent implements OnInit {
  
  bookingId!: number;
  historyId!: number;
  paymentStatus: string = '';
  paymentMessage: string = '';
  examinationDetails: any = null;
  loading = true;
  
  // Export states
  exportingInvoice = false;
  exportingPrescription = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examinationService: ExaminationService,
    private reportService: ReportService,
    private paymentService: PaymentService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Lấy bookingId từ route params (nếu có)
    const routeBookingId = this.route.snapshot.paramMap.get('id');
    console.log('routeBookingId', routeBookingId);
    if (routeBookingId) {
      this.bookingId = +routeBookingId;
    }
    
    // Kiểm tra query params cho payment status
    this.route.queryParams.subscribe(params => {
      this.paymentStatus = params['resultCode'] || params['status'] || '';
      this.paymentMessage = params['message'] || '';
      
      console.log('Payment params:', {
        resultCode: params['resultCode'],
        status: params['status'],
        message: params['message'],
        orderId: params['orderId'],
        amount: params['amount']
      });
      
      // Nếu không có bookingId từ route nhưng có thông tin thanh toán MoMo
      if (!this.bookingId && params['orderId']) {
        // Lấy bookingId từ localStorage
        const savedBookingId = localStorage.getItem('momo_booking_id');
        if (savedBookingId) {
          this.bookingId = +savedBookingId;
          localStorage.removeItem('momo_booking_id'); // Clean up
          console.log('BookingId retrieved from localStorage:', this.bookingId);
        }
      }
      
      // Load examination details nếu có bookingId
      if (this.bookingId) {
        this.loadExaminationDetails();
      } else {
        // Nếu vẫn không có bookingId, hiển thị thông báo thành công nhưng không load details
        this.loading = false;
        this.showPaymentResult();
      }
    });
  }
  
  loadExaminationDetails() {
    if (!this.bookingId) {
      console.log('No bookingId available, skipping examination details load');
      this.loading = false;
      this.showPaymentResult();
      return;
    }
    
    this.examinationService.getExaminationDetails(this.bookingId).subscribe({
      next: (details) => {
        this.examinationDetails = details;
        this.historyId = details.historyId;
        this.loading = false;
        
        // Hiển thị thông báo thanh toán
        this.showPaymentResult();
      },
      error: (error) => {
        console.error('Error loading examination details:', error);
        this.loading = false;
        // Vẫn hiển thị thông báo thanh toán thành công dù không load được details
        this.showPaymentResult();
      }
    });
  }
  
  showPaymentResult() {
    if (this.paymentStatus === '0' || this.paymentStatus === 'success') {
      this.toastService.showSuccess('Thanh toán MoMo thành công!', 'Thành công');
    } else if (this.paymentStatus) {
      this.toastService.showWarning('Thanh toán MoMo không thành công: ' + this.paymentMessage, 'Cảnh báo');
    }
  }
  
  // Export invoice
  exportInvoice() {
    if (!this.historyId) {
      this.toastService.showError('Không tìm thấy thông tin lịch sử khám', 'Lỗi');
      return;
    }
    
    this.exportingInvoice = true;
    this.reportService.exportInvoice(this.historyId).subscribe({
      next: (response) => {
        this.toastService.showSuccess('Xuất hóa đơn thành công!', 'Thành công');
        this.exportingInvoice = false;
      },
      error: (error) => {
        console.error('Error exporting invoice:', error);
        this.toastService.showError('Lỗi khi xuất hóa đơn', 'Lỗi');
        this.exportingInvoice = false;
      }
    });
  }
  
  // Export prescription
  exportPrescription() {
    if (!this.historyId) {
      this.toastService.showError('Không tìm thấy thông tin lịch sử khám', 'Lỗi');
      return;
    }
    
    this.exportingPrescription = true;
    this.reportService.exportPrescription(this.historyId).subscribe({
      next: (response) => {
        this.toastService.showSuccess('Xuất đơn thuốc thành công!', 'Thành công');
        this.exportingPrescription = false;
      },
      error: (error) => {
        console.error('Error exporting prescription:', error);
        this.toastService.showError('Lỗi khi xuất đơn thuốc', 'Lỗi');
        this.exportingPrescription = false;
      }
    });
  }
  
  // Finish and return to schedule
  finishAndGoToSchedule() {
    this.router.navigate(['/doctor/today-schedule']);
  }
  
  // Return to examination
  backToExamination() {
    this.router.navigate(['/doctor/examination', this.bookingId]);
  }
}

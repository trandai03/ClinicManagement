import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookingService } from 'src/app/services/booking.service';
import { ServiceRequestService, ServiceRequestModel } from 'src/app/services/service-request.service';
import { ExaminationService } from 'src/app/services/examination.service';
import { Booking } from 'src/app/models/booking';

interface ExaminationBooking extends Booking {
  serviceRequests?: ServiceRequestModel[];
  waitingTime?: number; // minutes since service was requested
  historyId?: number;
}

@Component({
  selector: 'app-in-progress',
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})
export class InProgressComponent implements OnInit, OnDestroy {

  inProgressBookings: ExaminationBooking[] = [];
  loading = false;
  private destroy$ = new Subject<void>();
  private refreshInterval: any;
  
  // Modal state for viewing service results
  showResultsModal = false;
  selectedBookingResults: ExaminationBooking | null = null;
  
  // Form state cho kết luận và chú ý
  doctorConclusion = '';
  doctorNotes = '';
  submittingConclusion = false;
  
  constructor(
    private bookingService: BookingService,
    private serviceRequestService: ServiceRequestService,
    private examinationService: ExaminationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInProgressBookings();
    // Auto refresh every 2 minutes instead of 30 seconds to reduce API calls
    this.refreshInterval = setInterval(() => {
      this.loadInProgressBookings();
    }, 120000); // 2 minutes
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadInProgressBookings() {
    this.loading = true;
    // Load bookings with status 'AWAITING_RESULTS' - bệnh nhân đang chờ kết quả xét nghiệm
    this.bookingService.getAllBooking('AWAITING_RESULTS', null, null, null, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings: Booking[]) => {
          if (bookings.length === 0) {
            this.inProgressBookings = [];
            this.loading = false;
            return;
          }

          // Load service requests for each booking in parallel
          const serviceRequestCalls = bookings.map(booking => 
            this.serviceRequestService.getAllServiceRequestsByBookingId(booking.id)
              .pipe(takeUntil(this.destroy$))
          );

          forkJoin(serviceRequestCalls).subscribe({
            next: (serviceRequestsArrays: ServiceRequestModel[][]) => {
              this.inProgressBookings = bookings.map((booking, index) => {
                const examBooking = booking as ExaminationBooking;
                examBooking.waitingTime = this.calculateWaitingTime(booking.date);
                examBooking.serviceRequests = serviceRequestsArrays[index] || [];
                return examBooking;
              });
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading service requests:', error);
              // Fallback: create bookings without service requests
              this.inProgressBookings = bookings.map(booking => {
                const examBooking = booking as ExaminationBooking;
                examBooking.waitingTime = this.calculateWaitingTime(booking.date);
                examBooking.serviceRequests = [];
                return examBooking;
              });
              this.loading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error loading in-progress bookings:', error);
          this.loading = false;
        }
      });
  }

  calculateWaitingTime(appointmentDate: string): number {
    const now = new Date();
    const appointment = new Date(appointmentDate);
    const diffMs = now.getTime() - appointment.getTime();
    return Math.floor(diffMs / (1000 * 60)); // minutes
  }

  continueExamination(booking: ExaminationBooking) {
    // Navigate back to examination with step = 'PRESCRIPTION'
    this.router.navigate(['/doctor/examination', booking.id], { 
      queryParams: { step: 'PRESCRIPTION' } 
    });
  }

  viewServiceResults(booking: ExaminationBooking) {
    // Hiển thị popup kết quả thay vì navigate
    this.selectedBookingResults = booking;
    this.showResultsModal = true;
    // Reset form khi mở modal
    this.doctorConclusion = '';
    this.doctorNotes = '';
    this.submittingConclusion = false;
  }

  closeResultsModal() {
    this.showResultsModal = false;
    this.selectedBookingResults = null;
    // Reset form
    this.doctorConclusion = '';
    this.doctorNotes = '';
    this.submittingConclusion = false;
  }

  // Xác nhận kết luận và chuyển sang kê thuốc
  confirmResultsAndProceedToPrescription() {
    console.log('confirmResultsAndProceedToPrescription called');
    
    if (!this.selectedBookingResults) {
      console.log('No selected booking results');
      return;
    }
    
    if (!this.doctorConclusion.trim()) {
      alert('Vui lòng nhập kết luận sau khi xem kết quả xét nghiệm!');
      return;
    }

    console.log('Starting to submit conclusion...', {
      bookingId: this.selectedBookingResults.id,
      conclusion: this.doctorConclusion,
      notes: this.doctorNotes
    });

    this.submittingConclusion = true;

    // Gọi API để lưu kết luận và chú ý vào database
    this.examinationService.updateConclusion(
      this.selectedBookingResults.id, 
      this.doctorConclusion, 
      this.doctorNotes
    )
    .subscribe({
      next: (response) => {
        console.log('Conclusion saved successfully:', response);
        this.submittingConclusion = false;
        
        // Navigate to prescription với delay để đảm bảo modal đã close
        setTimeout(() => {
          console.log('Navigating to examination with bookingId:', this.selectedBookingResults!.id);
          this.router.navigate(['/doctor/examination', this.selectedBookingResults!.id], { 
            queryParams: { 
              step: 'PRESCRIPTION',
              conclusion: this.doctorConclusion,
              notes: this.doctorNotes,
              historyId: this.selectedBookingResults!.historyId
            } 
          }).then(success => {
            console.log('Navigation result:', success);
            if (success) {
              this.closeResultsModal();
            }
          }).catch(error => {
            console.error('Navigation error:', error);
          });
        }, 100);
      },
      error: (error) => {
        console.error('Error saving conclusion:', error);
        this.submittingConclusion = false;
        alert('Có lỗi xảy ra khi lưu kết luận. Vui lòng thử lại!');
      }
    });
    
  }

  // Validate form
  isFormValid(): boolean {
    return this.doctorConclusion.trim().length > 0;
  }

  // Helper methods for displaying results
  hasResultsFile(service: ServiceRequestModel): boolean {
    return !!(service.labResultsFile && service.labResultsFile.trim().length > 0);
  }

  hasResultImages(service: ServiceRequestModel): boolean {
    return !!(service.resultImages && service.resultImages.trim().length > 0);
  }

  getResultImagesList(service: ServiceRequestModel): string[] {
    if (!service.resultImages) return [];
    return service.resultImages.split(',').map(url => url.trim()).filter(url => url.length > 0);
  }

  openFileInNewTab(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  openImageInNewTab(imageUrl: string) {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'REQUESTED': return '#ff9800'; // orange
      case 'IN_PROGRESS': return '#2196f3'; // blue  
      case 'COMPLETED': return '#4caf50'; // green
      case 'REVIEWED': return '#9c27b0'; // purple
      case 'CANCELLED': return '#f44336'; // red
      default: return '#9e9e9e'; // grey
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'Đã yêu cầu';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
      case 'REVIEWED': return 'Đã có kết quả';
      case 'CANCELLED': return 'Đã hủy';
      default: return 'Không xác định';
    }
  }

  getWaitingTimeText(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}p`;
    }
  }

  getWaitingTimeClass(minutes: number): string {
    if (minutes < 30) return 'waiting-normal';
    if (minutes < 60) return 'waiting-warning';
    return 'waiting-urgent';
  }

  allServicesCompleted(booking: ExaminationBooking): boolean {
    return booking.serviceRequests?.every(sr => sr.status === 'COMPLETED' || sr.status === 'REVIEWED') || false;
  }

  refreshData() {
    this.loadInProgressBookings();
  }

  getCompletedCount(): number {
    return this.inProgressBookings.filter(booking => this.allServicesCompleted(booking)).length;
  }

  getWaitingOverOneHourCount(): number {
    return this.inProgressBookings.filter(booking => (booking.waitingTime || 0) > 60).length;
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Test navigation method
  testNavigation() {
    if (!this.selectedBookingResults) {
      alert('Chưa chọn booking');
      return;
    }
    
    console.log('Testing navigation to examination with bookingId:', this.selectedBookingResults.id);
    
    this.router.navigate(['/doctor/examination', this.selectedBookingResults.id], { 
      queryParams: { 
        step: 'PRESCRIPTION',
        test: 'true'
      } 
    }).then(success => {
      console.log('Test navigation result:', success);
      if (success) {
        this.closeResultsModal();
      }
    }).catch(error => {
      console.error('Test navigation error:', error);
    });
  }
} 
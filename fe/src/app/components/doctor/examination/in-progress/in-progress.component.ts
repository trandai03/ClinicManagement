import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { ServiceRequestService, ServiceRequestModel } from 'src/app/services/service-request.service';
import { Booking } from 'src/app/models/booking';

interface ExaminationBooking extends Booking {
  serviceRequests?: ServiceRequestModel[];
  waitingTime?: number; // minutes since service was requested
}

@Component({
  selector: 'app-in-progress',
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})
export class InProgressComponent implements OnInit {

  inProgressBookings: ExaminationBooking[] = [];
  loading = false;
  
  constructor(
    private bookingService: BookingService,
    private serviceRequestService: ServiceRequestService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInProgressBookings();
    // Auto refresh every 30 seconds
    setInterval(() => {
      this.loadInProgressBookings();
    }, 30000);
  }

  loadInProgressBookings() {
    this.loading = true;
    // Load bookings with status 'AWAITING_RESULTS' - bệnh nhân đang chờ kết quả xét nghiệm
    this.bookingService.getAllBooking('AWAITING_RESULTS', null, null, null, null).subscribe({
      next: (bookings: Booking[]) => {
        if (bookings.length === 0) {
          this.inProgressBookings = [];
          this.loading = false;
          return;
        }

        // Load service requests for each booking in parallel
        const serviceRequestCalls = bookings.map(booking => 
          this.serviceRequestService.getAllServiceRequestsByBookingId(booking.id)
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
    // Navigate to view service results
    this.router.navigate(['/doctor/service-results', booking.id]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'REQUESTED': return '#ff9800'; // orange
      case 'IN_PROGRESS': return '#2196f3'; // blue  
      case 'COMPLETED': return '#4caf50'; // green
      case 'CANCELLED': return '#f44336'; // red
      default: return '#9e9e9e'; // grey
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'Đã yêu cầu';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
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
    return booking.serviceRequests?.every(sr => sr.status === 'COMPLETED') || false;
  }

  refreshData() {
    this.loadInProgressBookings();
  }
} 
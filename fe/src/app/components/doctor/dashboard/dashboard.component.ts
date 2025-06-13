import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Hours } from 'src/app/models/hour';
import { BookingService } from 'src/app/services/booking.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  // Legacy properties
  idcho = 0;
  idsap = 0;
  
  // New enhanced properties
  bookingCounts: any = {};
  todayBookings: any[] = [];
  hours = Hours;
  loading = false;

  constructor(
    private bookingsv: BookingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data
   */
  loadDashboardData() {
    this.loading = true;
    const todayFormatted = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    const doctorId = storageUtils.get('userId') || null;

    // Load workflow counts
    const counts$ = forkJoin({
      CONFIRMING: this.bookingsv.getAllBooking('CONFIRMING', doctorId, null, null, null),
      ACCEPTING: this.bookingsv.getAllBooking('ACCEPTING', doctorId, todayFormatted, todayFormatted, null),
      IN_PROGRESS: this.bookingsv.getAllBooking('IN_PROGRESS', doctorId, null, null, null),
      SUCCESS: this.bookingsv.getAllBooking('SUCCESS', doctorId, todayFormatted, todayFormatted, null)
    });

    counts$.subscribe({
      next: (results) => {
        this.bookingCounts = {
          CONFIRMING: results.CONFIRMING.length,
          ACCEPTING: results.ACCEPTING.length,
          IN_PROGRESS: results.IN_PROGRESS.length,
          SUCCESS: results.SUCCESS.length
        };

        // Set legacy properties for backward compatibility
        this.idcho = this.bookingCounts.CONFIRMING;
        this.idsap = this.bookingCounts.ACCEPTING;

        // Set today's bookings for preview
        this.todayBookings = results.ACCEPTING;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Get hour text from hour ID
   */
  getHourText(hourId: number): string {
    return this.hours[hourId - 1] || 'N/A';
  }

  /**
   * Get status text in Vietnamese
   */
  getStatusText(status: string): string {
    const statusMap: any = {
      'CONFIRMING': 'Chờ xác nhận',
      'ACCEPTING': 'Sẵn sàng khám',
      'IN_PROGRESS': 'Đang khám',
      'AWAITING_RESULTS': 'Chờ kết quả',
      'SUCCESS': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status badge CSS class
   */
  getStatusBadgeClass(status: string): string {
    const classMap: any = {
      'CONFIRMING': 'bg-warning',
      'ACCEPTING': 'bg-primary',
      'IN_PROGRESS': 'bg-info',
      'AWAITING_RESULTS': 'bg-secondary',
      'SUCCESS': 'bg-success',
      'CANCELLED': 'bg-danger'
    };
    return classMap[status] || 'bg-secondary';
  }

  /**
   * Start examination for a booking
   */
  startExamination(bookingId: number) {
    this.router.navigate(['/doctor/examination', bookingId]);
  }

  /**
   * Continue examination (navigate to in-progress)
   */
  continueExamination(bookingId: number) {
    this.router.navigate(['/doctor/in-progress']);
  }

  /**
   * Refresh dashboard data
   */
  refreshData() {
    this.loadDashboardData();
  }
}

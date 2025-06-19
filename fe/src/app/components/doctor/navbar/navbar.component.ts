import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { NotifiService } from 'src/app/services/notification.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Counter badges
  pendingCount = 0;
  todayCount = 0;
  inProgressCount = 0;
  notificationCount = 0;

  // Auto refresh subscription
  private refreshSubscription?: Subscription;

  constructor(
    private bookingService: BookingService,
    private notificationService: NotifiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load initial counts
    this.loadAllCounts();

    // Auto refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadAllCounts();
    });
  }

  ngOnDestroy() {
    // Cleanup subscription
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadAllCounts() {
    const doctorId = storageUtils.get('userId');
    if (!doctorId) return;

    // Load booking counts
    this.bookingService.getBookingCounts(doctorId).subscribe({
      next: (counts) => {
        this.pendingCount = counts.CONFIRMING;
        this.todayCount = counts.ACCEPTING;
        this.inProgressCount = counts.IN_PROGRESS + counts.AWAITING_RESULTS;
      },
      error: (error: any) => {
        console.error('Error loading booking counts:', error);
      }
    });

    // Load notification count
    this.notificationService.getUnreadCount(doctorId).subscribe({
      next: (count: number) => {
        this.notificationCount = count;
      },
      error: (error: any) => {
        console.error('Error loading notification count:', error);
      }
    });
  }

  // Helper method to check if current route is active
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}

import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Booking } from 'src/app/models/booking';
import { Hours } from 'src/app/models/hour';
import { BookingService, BookingCounts } from 'src/app/services/booking.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, OnDestroy {
  
  // UI State - updated tabs for doctor view
  activeTab: string = 'CONFIRMING';
  
  // Booking data
  currentBookings: Booking[] = [];
  
  // Counters for badges - updated for doctor workflow
  confirmingCount = 0;
  acceptingCount = 0;
  inProgressCount = 0;
  awaitingResultsCount = 0;
  successCount = 0;
  
  // Legacy properties
  lbooking: any;
  hours = Hours;
  dtTrigger: Subject<any> = new Subject();
  dtOption: DataTables.Settings = {};
  isDtInitialized = false;
  
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  itemout: Booking = {
    id: 0,
    name: '',
    gender: '',
    dob: '',
    date: '',
    idHour: 0,
    status: '',
    note: '',
    nameDoctor: '',
    major: '',
    email: '',
    phone: ''
  };
  
  constructor(
    private bookingSv: BookingService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers',
      destroy: true // Allow reinitialisation
    };
    
    // Load initial data and counts
    this.loadAllCountsOptimized();
    this.switchTab('CONFIRMING');
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    this.dtTrigger.unsubscribe();
  }

  switchTab(status: string) {
    this.activeTab = status;
    // Destroy existing DataTable if switching from CONFIRMING
    if (this.isDtInitialized && this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.isDtInitialized = false;
        this.loadBookingsByStatus(status);
      });
    } else {
      this.loadBookingsByStatus(status);
    }
  }

  loadBookingsByStatus(status: string) {
    const doctorId = storageUtils.get('userId') || null;
    this.bookingSv.getAllBooking(status, doctorId, null, null, null).subscribe({
      next: (bookings: Booking[]) => {
        this.currentBookings = bookings;
        this.lbooking = bookings; // Keep for legacy compatibility
        
        // Only trigger datatable for CONFIRMING tab and if not already initialized
        if (status === 'CONFIRMING' && !this.isDtInitialized) {
          setTimeout(() => {
            this.dtTrigger.next(null);
            this.isDtInitialized = true;
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.currentBookings = [];
      }
    });
  }

  // Optimized method using caching
  loadAllCountsOptimized() {
    const doctorId = storageUtils.get('userId') || null;
    if (!doctorId) return;
    
    // Try new endpoint first, fallback if fails
    this.bookingSv.getBookingCounts(doctorId).subscribe({
      next: (counts: BookingCounts) => {
        this.confirmingCount = counts.CONFIRMING;
        this.acceptingCount = counts.ACCEPTING;
        this.inProgressCount = counts.IN_PROGRESS;
        this.awaitingResultsCount = counts.AWAITING_RESULTS;
        this.successCount = counts.SUCCESS;
        console.log('Loaded counts from backend endpoint:', counts);
      },
      error: (error) => {
        console.warn('Backend counts endpoint failed, using fallback:', error);
        // Fallback to multiple API calls
        this.bookingSv.getBookingCountsFallback(doctorId).subscribe({
          next: (counts: BookingCounts) => {
            this.confirmingCount = counts.CONFIRMING;
            this.acceptingCount = counts.ACCEPTING;
            this.inProgressCount = counts.IN_PROGRESS;
            this.awaitingResultsCount = counts.AWAITING_RESULTS;
            this.successCount = counts.SUCCESS;
            console.log('Loaded counts from fallback method:', counts);
          },
          error: (fallbackError) => {
            console.error('Both methods failed, using original method:', fallbackError);
            this.loadAllCounts();
          }
        });
      }
    });
  }

  // Original method as fallback
  loadAllCounts() {
    const doctorId = storageUtils.get('userId') || null;
    
    this.bookingSv.getBookingCounts(doctorId).subscribe(res => {
      this.confirmingCount = res.CONFIRMING;
      this.acceptingCount = res.ACCEPTING;
      this.inProgressCount = res.IN_PROGRESS;
      this.awaitingResultsCount = res.AWAITING_RESULTS;
      this.successCount = res.SUCCESS;
      console.log('Loaded counts from fallback method:', res);
    });
  }

  // Legacy methods
  xem(item: Booking) {
    this.itemout = item;
  }

  loaddata() {
    // Clear cache when manually reloading data
    const doctorId = storageUtils.get('userId') || null;
    if (doctorId) {
      this.bookingSv.clearCountsCache(doctorId);
    }
    
    // Reset DataTable flag when reloading data
    if (this.isDtInitialized && this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.isDtInitialized = false;
        this.loadAllCountsOptimized();
        this.loadBookingsByStatus(this.activeTab);
      });
    } else {
      this.loadAllCountsOptimized();
      this.loadBookingsByStatus(this.activeTab);
    }
  }

  // Updated to use CONFIRMING instead of ACCEPTING for confirmation
  xacnhan(id: number) {
    this.bookingSv.updateBooking(id, 'ACCEPTING').subscribe({
      next: (value) => {
        // Clear cache before reloading
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.loaddata();
        this.toastr.success('Đã xác nhận thành công');
      },
      error: (err) => {
        this.toastr.error('Đã xảy ra lỗi khi xác nhận');
      }
    });
  }

  huy(id: number) {
    this.bookingSv.delete(id).subscribe({
      next: (value) => {
        // Clear cache before reloading
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.loaddata();
        this.toastr.success('Đã hủy thành công');
      },
      error: (err) => {
        this.toastr.error('Có lỗi: ' + err);
      }
    });
  }

  // Workflow methods for doctor
  confirmBooking(bookingId: number) {
    this.bookingSv.updateBooking(bookingId, 'CONFIRMING').subscribe({
      next: () => {
        // Clear cache before reloading
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.loaddata();
        this.toastr.success('Đã xác nhận lịch hẹn');
      },
      error: (err) => {
        this.toastr.error('Có lỗi khi xác nhận: ' + err);
      }
    });
  }

  acceptBooking(bookingId: number) {
    this.bookingSv.updateBooking(bookingId, 'ACCEPTING').subscribe({
      next: () => {
        // Clear cache before reloading
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.loaddata();
        this.toastr.success('Đã chấp nhận lịch hẹn');
      },
      error: (err) => {
        this.toastr.error('Có lỗi khi chấp nhận: ' + err);
      }
    });
  }

  startExamination(bookingId: number) {
    this.bookingSv.updateBooking(bookingId, 'IN_PROGRESS').subscribe({
      next: () => {
        // Clear cache and navigate
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.router.navigate(['/doctor/examination', bookingId]);
      },
      error: (err) => {
        this.toastr.error('Có lỗi khi bắt đầu khám: ' + err);
      }
    });
  }

  continueExamination(bookingId: number) {
    console.log('continueExamination called for booking:', bookingId);
    this.router.navigate(['/doctor/examination', bookingId]);
  }

  // Method for when test results are ready
  continueAfterResults(bookingId: number) {
    console.log('continueAfterResults called for booking:', bookingId);
    // Move booking back to IN_PROGRESS to continue examination
    this.bookingSv.updateBooking(bookingId, 'IN_PROGRESS').subscribe({
      next: () => {
        console.log('Successfully updated booking to IN_PROGRESS');
        // Clear cache since status changed
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.router.navigate(['/doctor/examination', bookingId], { 
          queryParams: { step: 'PRESCRIPTION' } 
        });
      },
      error: (err) => {
        console.error('Error updating booking status:', err);
        this.toastr.error('Có lỗi: ' + err);
      }
    });
  }

  completeExamination(bookingId: number) {
    this.bookingSv.updateBooking(bookingId, 'SUCCESS').subscribe({
      next: () => {
        // Clear cache before reloading
        const doctorId = storageUtils.get('userId');
        if (doctorId) {
          this.bookingSv.clearCountsCache(doctorId);
        }
        this.loaddata();
        this.toastr.success('Đã hoàn thành khám');
      },
      error: (err) => {
        this.toastr.error('Có lỗi khi hoàn thành: ' + err);
      }
    });
  }

  viewHistory(bookingId: number) {
    this.router.navigate(['/doctor/history'], { 
      queryParams: { bookingId: bookingId } 
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMING': return 'Chờ xác nhận';
      case 'ACCEPTING': return 'Đã xác nhận';  
      case 'IN_PROGRESS': return 'Đang khám';
      case 'AWAITING_RESULTS': return 'Chờ kết quả XN';
      case 'SUCCESS': return 'Hoàn thành';
      case 'FAILURE': return 'Thất bại';
      case 'CANCELLED': return 'Đã hủy';
      default: return 'Không xác định';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMING': return 'bg-warning';
      case 'ACCEPTING': return 'bg-success';
      case 'IN_PROGRESS': return 'bg-info';
      case 'AWAITING_RESULTS': return 'bg-primary';
      case 'SUCCESS': return 'bg-dark';
      case 'FAILURE': return 'bg-danger';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}

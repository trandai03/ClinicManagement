import { Injectable } from "@angular/core";
import { Booking, BookingDTO } from "../models/booking";
import { Observable, delay, map, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environment/environment.dev";
import { apiResponse } from "../models/apiResponse";
import { storageUtils } from "../utils/storage";

// Interface for booking counts response
export interface BookingCounts {
  CONFIRMING: number;
  ACCEPTING: number;
  IN_PROGRESS: number;
  AWAITING_RESULTS: number;
  SUCCESS: number;
}

// Interface for booking status update
export interface BookingStatusUpdate {
  bookingId: number;
  status: string;
  notes?: string;
}

@Injectable({
    providedIn: 'root'
  })
  export class BookingService {
  
    apiUrl = environment.apiBaseUrl;
    private readonly COUNTS_CACHE_KEY = 'booking_counts';
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    constructor(private http: HttpClient) { }
  
    getAllBooking(param : string, idDoctor : string | null, start : string | null, end : string | null, email : string | null) : Observable<Booking[]> {
      let st = '', en = '',id = ''
      if(start != null && start != '') st =  '&start=' + start;
      if(end != null && end != '') en = '&end=' + end;
      if(idDoctor != null && idDoctor != '') id = '&idDoctor='+ idDoctor;
      if(email != null && email != '') id = '&email='+ email;
      const s = `${this.apiUrl}api/v1/bookings?status=${param}${st}${en}${id}`
      console.log(s)
      return this.http.get<apiResponse<any>>(s).pipe(
        map(e =>e.data )
      )
    }

    /**
     * Lấy booking theo ID
     */
    getBookingById(bookingId: number): Observable<Booking> {
      return this.http.get<apiResponse<Booking>>(`${this.apiUrl}api/v1/booking/${bookingId}`).pipe(
        map(response => response.data)
      );
    }

    /**
     * Lấy bookings theo trạng thái AWAITING_RESULTS
     */
    getAwaitingResultsBookings(doctorId: string): Observable<Booking[]> {
      return this.getAllBooking('AWAITING_RESULTS', doctorId, null, null, null);
    }

    // Optimized method to get booking counts with caching
    getBookingCounts(doctorId: string): Observable<BookingCounts> {
      // Check cache first
      const cached = this.getCachedCounts(doctorId);
      if (cached) {
        return of(cached);
      }

      // Use new backend endpoint
      return this.http.get<apiResponse<any>>(`${this.apiUrl}api/v1/bookings/counts?idDoctor=${doctorId}`).pipe(
        map(response => {
          const counts: BookingCounts = response.data;
          this.setCachedCounts(doctorId, counts);
          return counts;
        })
      );
    }

    // Fallback method using existing API (for when backend doesn't have counts endpoint yet)
    getBookingCountsFallback(doctorId: string): Observable<BookingCounts> {
      // Check cache first
      const cached = this.getCachedCounts(doctorId);
      if (cached) {
        return of(cached);
      }

      // Use multiple parallel calls (better than sequential)
      return new Observable<BookingCounts>(observer => {
        let completed = 0;
        const total = 5;
        const counts: BookingCounts = {
          CONFIRMING: 0,
          ACCEPTING: 0,
          IN_PROGRESS: 0,
          AWAITING_RESULTS: 0,
          SUCCESS: 0
        };

        const checkComplete = () => {
          completed++;
          if (completed === total) {
            this.setCachedCounts(doctorId, counts);
            observer.next(counts);
            observer.complete();
          }
        };

        const handleError = (error: any) => {
          console.error('Error fetching booking counts:', error);
          observer.error(error);
        };

        // Execute all calls in parallel
        this.getAllBooking('CONFIRMING', doctorId, null, null, null).subscribe({
          next: res => { counts.CONFIRMING = res.length; checkComplete(); },
          error: handleError
        });
        
        this.getAllBooking('ACCEPTING', doctorId, null, null, null).subscribe({
          next: res => { counts.ACCEPTING = res.length; checkComplete(); },
          error: handleError
        });
        
        this.getAllBooking('IN_PROGRESS', doctorId, null, null, null).subscribe({
          next: res => { counts.IN_PROGRESS = res.length; checkComplete(); },
          error: handleError
        });
        
        this.getAllBooking('AWAITING_RESULTS', doctorId, null, null, null).subscribe({
          next: res => { counts.AWAITING_RESULTS = res.length; checkComplete(); },
          error: handleError
        });
        
        this.getAllBooking('SUCCESS', doctorId, null, null, null).subscribe({
          next: res => { counts.SUCCESS = res.length; checkComplete(); },
          error: handleError
        });
      });
    }

    private getCachedCounts(doctorId: string): BookingCounts | null {
      try {
        const cached = storageUtils.get(`${this.COUNTS_CACHE_KEY}_${doctorId}`);
        if (cached) {
          const data = JSON.parse(cached);
          const now = Date.now();
          if (now - data.timestamp < this.CACHE_DURATION) {
            return data.counts;
          }
        }
      } catch (e) {
        console.warn('Error reading cached counts:', e);
      }
      return null;
    }

    private setCachedCounts(doctorId: string, counts: BookingCounts): void {
      try {
        const cacheData = {
          counts,
          timestamp: Date.now()
        };
        storageUtils.set(`${this.COUNTS_CACHE_KEY}_${doctorId}`, JSON.stringify(cacheData));
      } catch (e) {
        console.warn('Error caching counts:', e);
      }
    }

    // Method to clear cache when booking status changes
    clearCountsCache(doctorId: string): void {
      storageUtils.remove(`${this.COUNTS_CACHE_KEY}_${doctorId}`);
    }

    /**
     * Lấy số lượng booking của các bác sĩ trong tháng (cho thống kê top performers)
     */
    getDoctorBookingCounts(): Observable<Map<number, number>> {
      return this.http.get<apiResponse<any>>(`${this.apiUrl}api/v1/bookings/doctor/counts`).pipe(
        map(response => {
          const data = response.data;
          const result = new Map<number, number>();
          
          // Convert object to Map
          for (const [doctorId, count] of Object.entries(data)) {
            result.set(parseInt(doctorId), count as number);
          }
          
          return result;
        })
      );
    }

    createBooking(name:string,dob:Date,phone:string,email:string,gender:string,address:string,idMajor:string,
      idUser:string,date:string,idHour:string,note:string) {
        const s = {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note};
        console.log('Gia tri json : ')
        console.log(s)
      return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/booking`,
      {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note});
    }

    /**
     * Cập nhật trạng thái booking (method cũ - backward compatibility)
     */
    updateBooking(id: number, status : string) {
      const result = this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/booking/${id}`, {status});
      this.clearCountsCache(id.toString());
      return result;
    }

    /**
     * Cập nhật trạng thái booking với validation workflow
     */
    updateBookingStatus(bookingId: number, newStatus: string, notes?: string): Observable<Booking> {
      const updateData: BookingStatusUpdate = {
        bookingId,
        status: newStatus,
        notes
      };
      
      const result = this.http.put<apiResponse<Booking>>(`${this.apiUrl}api/v1/booking/${bookingId}/status`, updateData).pipe(
        map(response => response.data)
      );
      
      // Clear cache after status update
      this.clearCountsCache(bookingId.toString());
      
      return result;
    }

    /**
     * Chuyển booking từ IN_PROGRESS sang AWAITING_RESULTS
     */
    moveToAwaitingResults(bookingId: number, notes?: string): Observable<Booking> {
      return this.updateBookingStatus(bookingId, 'AWAITING_RESULTS', notes);
    }

    /**
     * Chuyển booking từ AWAITING_RESULTS sang SUCCESS
     */
    completeBooking(bookingId: number, notes?: string): Observable<Booking> {
      return this.updateBookingStatus(bookingId, 'SUCCESS', notes);
    }

    /**
     * Chấp nhận booking (CONFIRMING -> ACCEPTING)
     */
    acceptBooking(bookingId: number, notes?: string): Observable<Booking> {
      return this.updateBookingStatus(bookingId, 'ACCEPTING', notes);
    }

    /**
     * Bắt đầu khám (ACCEPTING -> IN_PROGRESS)
     */
    startExamination(bookingId: number, notes?: string): Observable<Booking> {
      return this.updateBookingStatus(bookingId, 'IN_PROGRESS', notes);
    }

    /**
     * Từ chối booking
     */
    rejectBooking(bookingId: number, reason?: string): Observable<Booking> {
      return this.updateBookingStatus(bookingId, 'CANCELLED', reason);
    }

    /**
     * Kiểm tra xem có thể chuyển trạng thái không
     */
    canTransitionTo(currentStatus: string, newStatus: string): boolean {
      const validTransitions: { [key: string]: string[] } = {
        'PENDING': ['CONFIRMING', 'CANCELLED'],
        'CONFIRMING': ['ACCEPTING', 'CANCELLED'],
        'ACCEPTING': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['AWAITING_RESULTS', 'SUCCESS', 'CANCELLED'],
        'AWAITING_RESULTS': ['SUCCESS', 'CANCELLED'],
        'SUCCESS': [],
        'CANCELLED': []
      };
      
      return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    /**
     * Lấy danh sách trạng thái có thể chuyển đến
     */
    getAvailableTransitions(currentStatus: string): string[] {
      const validTransitions: { [key: string]: string[] } = {
        'PENDING': ['CONFIRMING', 'CANCELLED'],
        'CONFIRMING': ['ACCEPTING', 'CANCELLED'],
        'ACCEPTING': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['AWAITING_RESULTS', 'SUCCESS', 'CANCELLED'],
        'AWAITING_RESULTS': ['SUCCESS', 'CANCELLED'],
        'SUCCESS': [],
        'CANCELLED': []
      };
      
      return validTransitions[currentStatus] || [];
    }

    /**
     * Lấy text hiển thị cho trạng thái
     */
    getStatusDisplayText(status: string): string {
      const statusMap: { [key: string]: string } = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMING': 'Đang xác nhận',
        'ACCEPTING': 'Đã chấp nhận',
        'IN_PROGRESS': 'Đang khám',
        'AWAITING_RESULTS': 'Chờ kết quả',
        'SUCCESS': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
      };
      return statusMap[status] || status;
    }

    /**
     * Lấy class CSS cho trạng thái
     */
    getStatusClass(status: string): string {
      const statusClassMap: { [key: string]: string } = {
        'PENDING': 'badge-warning',
        'CONFIRMING': 'badge-info',
        'ACCEPTING': 'badge-primary',
        'IN_PROGRESS': 'badge-success',
        'AWAITING_RESULTS': 'badge-secondary',
        'SUCCESS': 'badge-success',
        'CANCELLED': 'badge-danger'
      };
      return statusClassMap[status] || 'badge-secondary';
    }

    delete(id : number) {
      return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/booking/${id}`);
    }

    /**
     * Validate booking data trước khi tạo
     */
    validateBookingData(bookingData: any): string[] {
      const errors: string[] = [];
      
      if (!bookingData.name || bookingData.name.trim() === '') {
        errors.push('Họ tên là bắt buộc');
      }
      
      if (!bookingData.phone || bookingData.phone.trim() === '') {
        errors.push('Số điện thoại là bắt buộc');
      }
      
      if (!bookingData.email || bookingData.email.trim() === '') {
        errors.push('Email là bắt buộc');
      }
      
      if (!bookingData.date) {
        errors.push('Ngày khám là bắt buộc');
      }
      
      if (!bookingData.idHour) {
        errors.push('Giờ khám là bắt buộc');
      }
      
      if (!bookingData.idUser) {
        errors.push('Bác sĩ là bắt buộc');
      }
      
      return errors;
    }
  }
  
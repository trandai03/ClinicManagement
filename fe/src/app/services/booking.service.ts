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

    createBooking(name:string,dob:Date,phone:string,email:string,gender:string,address:string,idMajor:string,
      idUser:string,date:string,idHour:string,note:string) {
        const s = {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note};
        console.log('Gia tri json : ')
        console.log(s)
      return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/booking`,
      {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note});
    }

    updateBooking(id: number, status : string) {
      return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/booking/${id}`, {status});
      this.clearCountsCache(id.toString());
      this.getBookingCounts(id.toString());
    }

    delete(id : number) {
      return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/booking/${id}`);
    }
  }
  
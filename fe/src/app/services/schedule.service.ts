import { Injectable } from '@angular/core';
import { Schedule, Schedules, schedules, DoctorScheduleHour, TimeSlot, SCHEDULE_STATUS } from '../models/schedule';
import { Observable, map, of, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  apiUrl = environment.apiBaseUrl;
  constructor(private http : HttpClient) {}

  getAllSchedule(): Observable<Schedule[]> {
    return of(schedules);
  }

  getAllScheduleByIdDoctor(id : string): Observable<Schedules[]> {
    return this.http.get<apiResponse<Schedules[]>>(`${this.apiUrl}api/v1/schedule-doctor/available-slots/doctor/${id}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching doctor schedules:', error);
        return throwError(() => new Error('Không thể tải lịch làm việc của bác sĩ'));
      })
    );
  }

  // Create doctor schedule
  createSchedule(idUser: string, hours: number[], date: string, note: string = ''): Observable<any> {
    const payload = {
      idUser: idUser,
      hours: hours,
      date: date,
      note: note
    };
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/schedule-doctor`, payload).pipe(
      catchError(error => {
        console.error('Error creating schedule:', error);
        return throwError(() => new Error('Không thể tạo lịch làm việc'));
      })
    );
  }

  // Delete doctor schedule
  deleteSchedule(id: number): Observable<any> {
    return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/schedule-doctor/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting schedule:', error);
        return throwError(() => new Error('Không thể xóa lịch làm việc'));
      })
    );
  }

  // Get doctor schedules by date range
  getDoctorSchedulesByDateRange(idDoctor: string, fromDate: string, toDate: string): Observable<DoctorScheduleHour[]> {
    return this.http.get<apiResponse<DoctorScheduleHour[]>>(`${this.apiUrl}api/v1/schedule-doctor/doctor/${idDoctor}?fromDate=${fromDate}&toDate=${toDate}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching doctor schedules by date range:', error);
        return throwError(() => new Error('Không thể tải lịch làm việc theo khoảng thời gian'));
      })
    );
  }

  // ========== NEW ENHANCED APIS ==========

  // Update doctor schedule
  updateDoctorSchedule(scheduleId: number, status: string, note?: string, reason?: string): Observable<any> {
    const payload = { status, note, reason };
    return this.http.put<apiResponse<any>>(`${this.apiUrl}api/v1/schedule-doctor/${scheduleId}`, payload).pipe(
      catchError(error => {
        console.error('Error updating doctor schedule:', error);
        return throwError(() => new Error('Không thể cập nhật lịch làm việc'));
      })
    );
  }

  // Delete all schedules of doctor in a specific date
  deleteDoctorScheduleByDate(doctorId: number, date: string): Observable<any> {
    return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/schedule-doctor/doctor/${doctorId}/date/${date}`).pipe(
      catchError(error => {
        console.error('Error deleting doctor schedule by date:', error);
        return throwError(() => new Error('Không thể xóa lịch làm việc theo ngày'));
      })
    );
  }

  // Get available slots by major and date (optimized for BY_DATE booking)
  getAvailableSlotsByMajorAndDate(majorId: number, date: string): Observable<any[]> {
    return this.http.get<apiResponse<any[]>>(`${this.apiUrl}api/v1/schedule-doctor/available-slots/major/${majorId}?date=${date}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching available slots by major:', error);
        return throwError(() => new Error('Không thể tải slots theo chuyên khoa'));
      })
    );
  }

  // Lấy danh sách ngày có bác sĩ của chuyên khoa nhận booking
  getAvailableDayByMajor(majorId: number): Observable<any[]> {
    return this.http.get<apiResponse<any[]>>(`${this.apiUrl}api/v1/schedule-doctor/available-days/major/${majorId}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching available slots by major:', error);
        return throwError(() => new Error('Không thể tải slots theo chuyên khoa'));
      })
    );
  }

  // Get available dates for a doctor - Lấy danh sách ngày mà bác sĩ có lịch
  getDoctorAvailableDates(doctorId: string): Observable<string[]> {
    return this.http.get<apiResponse<string[]>>(`${this.apiUrl}api/v1/schedule-doctor/available-dates/doctor/${doctorId}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching doctor available dates:', error);
        return throwError(() => new Error('Không thể tải ngày có lịch của bác sĩ'));
      })
    );
  }

  // Get doctor working hours for specific date - Lấy ca làm việc của bác sĩ trong ngày cụ thể
  getDoctorWorkingHoursForDate(doctorId: string, date: string): Observable<DoctorScheduleHour[]> {
    return this.http.get<apiResponse<DoctorScheduleHour[]>>(`${this.apiUrl}api/v1/schedule-doctor/available-slots/doctor/${doctorId}?date=${date}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching doctor working hours for date:', error);
        return throwError(() => new Error('Không thể tải ca làm việc của bác sĩ'));
      })
    );
  }

  // Check if a specific slot is available
  checkSlotAvailability(doctorId: number, hourId: number, date: string): Observable<boolean> {
    return this.http.get<apiResponse<{available: boolean}>>(`${this.apiUrl}api/v1/schedule-doctor/check-availability?doctorId=${doctorId}&hourId=${hourId}&date=${date}`).pipe(
      map(response => response.data?.available || false),
      catchError(error => {
        console.error('Error checking slot availability:', error);
        return of(false);
      })
    );
  }

  // Get doctor schedule statistics
  getDoctorScheduleStatistics(doctorId: number, fromDate: string, toDate: string): Observable<any> {
    return this.http.get<apiResponse<any>>(`${this.apiUrl}api/v1/schedule-doctor/statistics/doctor/${doctorId}?fromDate=${fromDate}&toDate=${toDate}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching doctor statistics:', error);
        return throwError(() => new Error('Không thể tải thống kê lịch làm việc'));
      })
    );
  }

  // Create unavailable period
  createUnavailablePeriod(idDoctor: string, fromDate: string, toDate: string, reason: string, note: string = ''): Observable<any> {
    const payload = {
      idDoctor: idDoctor,
      fromDate: fromDate,
      toDate: toDate,
      reason: reason,
      note: note
    };
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/schedule-doctor/unavailable`, payload).pipe(
      catchError(error => {
        console.error('Error creating unavailable period:', error);
        return throwError(() => new Error('Không thể tạo khoảng thời gian không có sẵn'));
      })
    );
  }

  // Helper methods cho schedule management
  
  /**
   * Lọc schedules theo ngày
   */
  filterSchedulesByDate(schedules: Schedules[], date: string): Schedules[] {
    return schedules.filter(schedule => schedule.date === date);
  }

  /**
   * Lấy tất cả hourIds từ schedules
   */
  getHourIdsFromSchedules(schedules: Schedules[]): number[] {
    return schedules.map(schedule => schedule.idHour);
  }

  /**
   * Kiểm tra xem bác sĩ có làm việc trong ngày không
   */
  isDoctorWorkingOnDate(schedules: Schedules[], date: string): boolean {
    return schedules.some(schedule => schedule.date === date);
  }

  /**
   * Đếm số giờ làm việc của bác sĩ trong ngày
   */
  countWorkingHoursOnDate(schedules: Schedules[], date: string): number {
    return schedules.filter(schedule => schedule.date === date).length;
  }

  /**
   * Tìm ngày bác sĩ làm việc >= maxHours (để disable date picker)
   */
  getFullyBookedDates(schedules: Schedules[], maxHours: number = 8): string[] {
    const dateHoursMap = new Map<string, number>();
    
    schedules.forEach(schedule => {
      const currentCount = dateHoursMap.get(schedule.date) || 0;
      dateHoursMap.set(schedule.date, currentCount + 1);
    });

    return Array.from(dateHoursMap.entries())
      .filter(([date, count]) => count >= maxHours)
      .map(([date]) => date);
  }

  /**
   * Convert date string to Date object
   */
  convertStringToDate(dateString: string): Date {
    // Format: dd/MM/yyyy
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateString);
  }

  /**
   * Validate schedule data
   */
  validateScheduleData(schedule: any): schedule is Schedules {
    return schedule && 
           typeof schedule.id === 'number' && 
           typeof schedule.date === 'string' && 
           typeof schedule.idHour === 'number';
  }

  /**
   * Merge available slots from multiple sources
   */
  mergeTimeSlots(slots1: TimeSlot[], slots2: TimeSlot[]): TimeSlot[] {
    const merged = [...slots1];
    
    slots2.forEach(slot2 => {
      const exists = merged.some(slot1 => 
        slot1.hourId === slot2.hourId && slot1.doctorId === slot2.doctorId
      );
      
      if (!exists) {
        merged.push(slot2);
      }
    });

    return merged.sort((a, b) => {
      if (a.hourId !== b.hourId) {
        return a.hourId - b.hourId;
      }
      return a.doctorName.localeCompare(b.doctorName);
    });
  }

  /**
   * Group schedules by date
   */
  groupSchedulesByDate(schedules: Schedules[]): Map<string, Schedules[]> {
    const grouped = new Map<string, Schedules[]>();
    
    schedules.forEach(schedule => {
      if (!grouped.has(schedule.date)) {
        grouped.set(schedule.date, []);
      }
      grouped.get(schedule.date)!.push(schedule);
    });

    return grouped;
  }
}

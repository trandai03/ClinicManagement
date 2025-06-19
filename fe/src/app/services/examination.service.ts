import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environment/environment.dev';
import { ExaminationStartDTO, ExaminationCompletionDTO, ExaminationDetailsResponse, UpdateConclusionBookingDTO } from '../models/examination.dto';

@Injectable({
  providedIn: 'root'
})
export class ExaminationService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Bắt đầu examination
   */
  startExamination(bookingId: number, startData: ExaminationStartDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}api/v1/examination/start/${bookingId}`, startData);
  }

  /**
   * Hoàn thành examination
   */
  completeExamination(completionData: ExaminationCompletionDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}api/v1/examination/complete`, completionData);
  }

  /**
   * Lấy chi tiết booking
   */
  getBookingDetails(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}api/v1/examination/booking/${bookingId}`);
  }

  /**
   * Lấy chi tiết examination đã hoàn thành
   */
  getExaminationDetails(bookingId: number): Observable<ExaminationDetailsResponse> {
    return this.http.get<{status: string, message: string, data: ExaminationDetailsResponse}>(`${this.apiUrl}api/v1/examination/details/${bookingId}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Cập nhật trạng thái booking trong examination workflow
   */
  updateBookingStatus(bookingId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}api/v1/examination/status/${bookingId}`, { status });
  }

  /**
   * Validate examination start data
   */
  validateExaminationStartData(startData: ExaminationStartDTO): string[] {
    const errors: string[] = [];
    
    if (!startData.roomNumber || startData.roomNumber.trim() === '') {
      errors.push('Số phòng là bắt buộc');
    }
    
    if (!startData.initialSymptoms || startData.initialSymptoms.trim() === '') {
      errors.push('Triệu chứng ban đầu là bắt buộc');
    }
    
    return errors;
  }

  /**
   * Validate examination completion data
   */
  validateExaminationCompletionData(completionData: ExaminationCompletionDTO): string[] {
    const errors: string[] = [];
    
    if (!completionData.bookingId) {
      errors.push('Booking ID là bắt buộc');
    }
    
    if (!completionData.notes || completionData.notes.trim() === '') {
      errors.push('Ghi chú khám bệnh là bắt buộc');
    }
    
    if (!completionData.totalAmount || completionData.totalAmount <= 0) {
      errors.push('Tổng tiền phải lớn hơn 0');
    }
    
    if (!completionData.paymentMethod || completionData.paymentMethod.trim() === '') {
      errors.push('Phương thức thanh toán là bắt buộc');
    }
    
    return errors;
  }

  /**
   * Helper method để tạo ExaminationStartDTO
   */
  createExaminationStartDTO(roomNumber: string, initialSymptoms: string, doctorNotes: string): ExaminationStartDTO {
    return {
      roomNumber,
      initialSymptoms,
      doctorNotes
    };
  }

  /**
   * Helper method để tạo ExaminationCompletionDTO
   */
  createExaminationCompletionDTO(
    bookingId: number,
    medicines: any[],
    services: any[],
    totalAmount: number,
    paymentMethod: string,
    notes: string
  ): ExaminationCompletionDTO {
    return {
      bookingId,
      medicines,
      services,
      totalAmount,
      paymentMethod,
      notes
    };
  }

  /**
   * Cập nhật kết luận và ghi chú sau khi xem kết quả
   */
  updateConclusion(bookingId: number, resultConclusion: string, resultNotes: string): Observable<any> {
    const updateData: UpdateConclusionBookingDTO = {
      bookingId: bookingId,
      resultConclusion: resultConclusion,
      resultNotes: resultNotes
    };
    
    return this.http.post(`${this.apiUrl}api/v1/examination/update-conclusion`, updateData);
  }
} 
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environment/environment.dev';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiResponse } from '../models/apiResponse';
import { History, HistoryDTO, HistoryDetails } from '../models/history';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  apiUrl = environment.apiBaseUrl;  

  constructor(private http: HttpClient) { }

  /**
   * Lấy tất cả histories
   */
  getAllHistories(): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}api/v1/histories`);
  }

  /**
   * Lấy history theo ID
   */
  getHistoryById(id: number): Observable<History> {
    return this.http.get<History>(`${this.apiUrl}api/v1/histories/${id}`);
  }

  /**
   * Lấy history theo booking ID
   */
  getHistoryByBookingId(bookingId: number): Observable<History> {
    return this.http.get<History>(`${this.apiUrl}api/v1/histories/booking/${bookingId}`);
  }

  /**
   * Lấy histories theo doctor ID
   */
  getHistoriesByDoctorId(doctorId: number): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}api/v1/histories/doctor/${doctorId}`);
  }

  /**
   * Tạo history mới
   */
  saveHistory(history: HistoryDTO): Observable<History> {
    return this.http.post<History>(`${this.apiUrl}api/v1/histories`, history);
  }

  /**
   * Cập nhật history
   */
  updateHistory(id: number, history: HistoryDTO): Observable<History> {
    return this.http.put<History>(`${this.apiUrl}api/v1/histories/${id}`, history);
  }

  /**
   * Xóa history
   */
  deleteHistory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}api/v1/histories/${id}`);
  }

  /**
   * Cập nhật phí thuốc và dịch vụ
   */
  updateHistoryFees(historyId: number, medicineFee?: number, serviceFee?: number): Observable<void> {
    let params = new HttpParams();
    if (medicineFee !== undefined) {
      params = params.set('medicineFee', medicineFee.toString());
    }
    if (serviceFee !== undefined) {
      params = params.set('serviceFee', serviceFee.toString());
    }
    
    return this.http.put<void>(`${this.apiUrl}api/v1/histories/${historyId}/fees`, null, { params });
  }

  /**
   * Tạo history từ examination (workflow mới)
   */
  createHistoryFromExamination(
    bookingId: number, 
    medicalSummary: string, 
    diagnosis?: string, 
    treatment?: string, 
    totalAmount?: number
  ): Observable<History> {
    let params = new HttpParams()
      .set('bookingId', bookingId.toString())
      .set('medicalSummary', medicalSummary);
    
    if (diagnosis) {
      params = params.set('diagnosis', diagnosis);
    }
    if (treatment) {
      params = params.set('treatment', treatment);
    }
    if (totalAmount) {
      params = params.set('totalAmount', totalAmount.toString());
    }
    
    return this.http.post<History>(`${this.apiUrl}api/v1/histories/create-from-examination`, null, { params });
  }

  /**
   * Export history PDF theo booking ID
   */
  exportHistory(bookingId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}api/v1/histories/exportResult/${bookingId}`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Download file PDF
   */
  downloadHistoryPDF(bookingId: number, fileName?: string): void {
    this.exportHistory(bookingId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `Hoa_don_kham_benh_${bookingId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Lỗi khi tải file PDF:', error);
      }
    });
  }

  /**
   * Legacy method - tìm kiếm history theo keyword (backward compatibility)
   */
  getHistory(keyword: string): Observable<any[]> {
    return this.http.get<apiResponse<any[]>>(`${this.apiUrl}api/v1/histories?name=${keyword}`).pipe(
      map(e => e.data)
    );
  }

  /**
   * Xuất báo cáo hóa đơn thanh toán
   */
  exportInvoice(historyId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}api/v1/histories/export-invoice/${historyId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Xuất báo cáo đơn thuốc
   */
  exportPrescription(historyId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}api/v1/histories/export-prescription/${historyId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Helper method để download file PDF
   */
  downloadPdfFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper method để tạo HistoryDTO từ form data
   */
  createHistoryDTO(formData: any): HistoryDTO {
    return {
      bookingId: formData.bookingId,
      medicalSummary: formData.medicalSummary || '',
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      doctorNotes: formData.doctorNotes,
      consultationFee: formData.consultationFee || 200000,
      medicineFee: formData.medicineFee,
      serviceFee: formData.serviceFee,
      totalMoney: formData.totalAmount || formData.totalMoney,
      // Legacy fields
      fullName: formData.fullName,
      dob: formData.dob,
      gender: formData.gender,
      nation: formData.nation,
      bhyt: formData.bhyt,
      address: formData.address,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      medicineStr: formData.medicineStr,
      serviceStr: formData.serviceStr
    };
  }

  /**
   * Validate history data trước khi gửi
   */
  validateHistoryData(historyData: HistoryDTO): string[] {
    const errors: string[] = [];
    
    if (!historyData.bookingId) {
      errors.push('Booking ID là bắt buộc');
    }
    
    if (!historyData.medicalSummary || historyData.medicalSummary.trim() === '') {
      errors.push('Tóm tắt y tế là bắt buộc');
    }
    
    if (!historyData.totalMoney || historyData.totalMoney <= 0) {
      errors.push('Tổng tiền phải lớn hơn 0');
    }
    
    return errors;
  }
} 
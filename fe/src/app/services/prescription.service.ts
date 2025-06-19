import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, finalize } from 'rxjs';
import { environment } from '../environment/environment.dev';


// Interfaces
export interface PrescriptionDetails {
  id: number;
  historyId: number;
  medicineId: number;
  medicineName: string;
  medicineUnit: string;
  quantity: number;
  dosage: string;
  instructions: string;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePrescriptionRequest {
  historyId: number;
  medicineId: number;
  quantity: number;
  dosage: string;
  instructions: string;
}

export interface CreateBulkPrescriptionRequest {
  historyId: number;
  prescriptions: PrescriptionRequest[];
}

export interface PrescriptionRequest {
  medicineId: number;
  quantity: number;
  dosage: string;
  instructions: string;
}

export interface UpdatePrescriptionRequest {
  quantity?: number;
  dosage?: string;
  instructions?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private readonly baseUrl = `${environment.apiBaseUrl}/prescription`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Lấy tất cả đơn thuốc theo historyId
   */
  getPrescriptionsByHistoryId(historyId: number): Observable<ApiResponse<PrescriptionDetails[]>> {
    return this.http.get<ApiResponse<PrescriptionDetails[]>>(
      `${this.baseUrl}/history/${historyId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi lấy danh sách đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Lấy đơn thuốc theo ID
   */
  getPrescriptionById(id: number): Observable<ApiResponse<PrescriptionDetails>> {
    return this.http.get<ApiResponse<PrescriptionDetails>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi lấy thông tin đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Tạo đơn thuốc mới
   */
  createPrescription(request: CreatePrescriptionRequest): Observable<ApiResponse<PrescriptionDetails>> {
    return this.http.post<ApiResponse<PrescriptionDetails>>(
      this.baseUrl,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi tạo đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Tạo nhiều đơn thuốc cùng lúc
   */
  createPrescriptions(request: CreateBulkPrescriptionRequest): Observable<ApiResponse<PrescriptionDetails[]>> {
    return this.http.post<ApiResponse<PrescriptionDetails[]>>(
      `${this.baseUrl}/bulk`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi tạo danh sách đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Cập nhật đơn thuốc
   */
  updatePrescription(id: number, request: UpdatePrescriptionRequest): Observable<ApiResponse<PrescriptionDetails>> {
    return this.http.put<ApiResponse<PrescriptionDetails>>(
      `${this.baseUrl}/${id}`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi cập nhật đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Xóa đơn thuốc
   */
  deletePrescription(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi xóa đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Xóa tất cả đơn thuốc theo historyId
   */
  deletePrescriptionsByHistoryId(historyId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/history/${historyId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi xóa tất cả đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Tính tổng giá thuốc theo historyId
   */
  calculateTotalMedicineFee(historyId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.baseUrl}/history/${historyId}/total-fee`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi tính tổng phí thuốc:', error);
        throw error;
      })
    );
  }
} 
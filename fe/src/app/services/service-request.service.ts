import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';
import { MedicineService } from '../models/medicineService';

export interface ServiceRequestDTO {
  serviceId: number;
  cost: number;
  requestNotes?: string;
  resultNotes?: string;
}

export interface ServiceRequestModel {
  id: number;
  bookingId: number;
  serviceName: string;
  serviceType: string;
  cost: number;
  status: string;
  requestNotes?: string;
  resultNotes?: string;
  requestedAt: string;
  completedAt?: string;
  // Các trường mới cho kết quả xét nghiệm
  labResultsFile?: string; // Link đến file PDF kết quả
  resultImages?: string; // Link ảnh kết quả (phân cách bằng dấu phẩy)
  labComments?: string; // Nhận xét của bác sĩ xét nghiệm
  reviewedAt?: string; // Thời gian review
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private apiUrl = `${environment.apiBaseUrl}api/v1/service-request`;
  
  // Simple cache with 2-minute expiry
  private cache = new Map<string, { data: any, timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  // API call tracking
  private apiCallCount = 0;
  private cacheHitCount = 0;

  constructor(private http: HttpClient) {}

  // Public method to get performance stats
  getPerformanceStats() {
    return {
      totalApiCalls: this.apiCallCount,
      cacheHits: this.cacheHitCount,
      cacheHitRate: this.apiCallCount > 0 ? (this.cacheHitCount / (this.apiCallCount + this.cacheHitCount) * 100).toFixed(1) : '0'
    };
  }

  // Reset stats
  resetPerformanceStats() {
    this.apiCallCount = 0;
    this.cacheHitCount = 0;
  }

  private getCacheKey(method: string, ...params: any[]): string {
    return `${method}_${params.join('_')}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      this.cacheHitCount++;
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCacheForBooking(bookingId: number): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(`_${bookingId}`));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Lấy tất cả service requests theo booking ID
   */
  getAllServiceRequestsByBookingId(bookingId: number): Observable<ServiceRequestModel[]> {
    const cacheKey = this.getCacheKey('getAllServiceRequestsByBookingId', bookingId);
    const cached = this.getFromCache<ServiceRequestModel[]>(cacheKey);
    
    if (cached) {
      console.log(`Cache hit for service requests booking ${bookingId}`);
      return of(cached);
    }

    console.log(`Cache miss - fetching service requests for booking ${bookingId}`);
    return this.http.get<ServiceRequestModel[]>(`${this.apiUrl}/${bookingId}`)
      .pipe(
        tap(data => this.setCache(cacheKey, data)),
        catchError(error => {
          console.error('Error fetching service requests:', error);
          return of([]);
        })
      );
  }

  /**
   * Tạo service request mới
   */
  createServiceRequest(bookingId: number, serviceRequestDTOs: ServiceRequestDTO[]): Observable<ServiceRequestModel[]> {
    return this.http.post<ServiceRequestModel[]>(`${this.apiUrl}/${bookingId}`, serviceRequestDTOs);
  }

  /**
   * Cập nhật service request
   */
  updateServiceRequest(serviceRequestId: number, serviceRequestDTO: ServiceRequestDTO): Observable<ServiceRequestModel> {
    return this.http.put<ServiceRequestModel>(`${this.apiUrl}/${serviceRequestId}`, serviceRequestDTO);
  }

  /**
   * Xóa service request
   */
  deleteServiceRequest(serviceRequestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${serviceRequestId}`);
  }

  /**
   * Lấy chi tiết service request theo ID
   */
  getServiceRequestById(serviceRequestId: number): Observable<ServiceRequestModel> {
    return this.http.get<ServiceRequestModel>(`${this.apiUrl}/detail/${serviceRequestId}`);
  }

  /**
   * Hoàn thành service request
   */
  completeServiceRequest(serviceRequestId: number, resultNotes?: string): Observable<ServiceRequestModel> {
    let url = `${this.apiUrl}/${serviceRequestId}/complete`;
    console.log(url);
    console.log( "serviceRequestId", serviceRequestId);
    if (resultNotes) {
      url += `?resultNotes=${encodeURIComponent(resultNotes)}`;
    }
    return this.http.put<ServiceRequestModel>(url, null)
      .pipe(
        tap(updatedRequest => {
          // Clear cache for this booking when service request is updated
          this.clearCacheForBooking(updatedRequest.bookingId);
        })
      );
  }

  /**
   * Lấy các service requests đang chờ kết quả theo doctor ID
   */
  getPendingServiceRequests(doctorId: number): Observable<ServiceRequestModel[]> {
    return this.http.get<ServiceRequestModel[]>(`${this.apiUrl}/pending/${doctorId}`);
  }

  /**
   * Lấy tổng chi phí service requests cho một booking
   */
  getTotalServiceCost(bookingId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/cost/${bookingId}`);
  }

  /**
   * Cập nhật nhiều service requests cùng lúc
   */
  updateMultipleServiceRequests(updates: ServiceRequestDTO[]): Observable<ServiceRequestModel[]> {
    return this.http.put<ServiceRequestModel[]>(`${this.apiUrl}/update-multiple`, updates);
  }

  /**
   * Lấy service requests theo history ID
   */
  getServiceRequestsByHistoryId(historyId: number): Observable<ServiceRequestModel[]> {
      return this.http.get<ServiceRequestModel[]>(`${this.apiUrl}/history/${historyId}`);
  }

  /**
   * Helper method để tạo ServiceRequestDTO
   */
  createServiceRequestDTO(serviceId: number, cost: number, requestNotes?: string, resultNotes?: string): ServiceRequestDTO {
    return {
      serviceId,
      cost,
      requestNotes,
      resultNotes
    };
  }

  /**
   * Kiểm tra xem tất cả service requests của booking đã hoàn thành chưa
   */
  areAllServiceRequestsCompleted(bookingId: number): Observable<boolean> {
    return this.getAllServiceRequestsByBookingId(bookingId).pipe(
      map(requests => requests.every(request => request.status === 'COMPLETED'))
    );
  }

  /**
   * Lấy số lượng service requests theo trạng thái
   */
  getServiceRequestCountByStatus(bookingId: number, status: string): Observable<number> {
    return this.getAllServiceRequestsByBookingId(bookingId).pipe(
      map(requests => requests.filter(request => request.status === status).length)
    );
  }

  /**
   * Validate service request data
   */
  validateServiceRequestData(serviceRequestDTO: ServiceRequestDTO): string[] {
    const errors: string[] = [];
    
    if (!serviceRequestDTO.serviceId) {
      errors.push('Service ID là bắt buộc');
    }
    
    if (!serviceRequestDTO.cost || serviceRequestDTO.cost <= 0) {
      errors.push('Chi phí phải lớn hơn 0');
    }
    
    return errors;
  }

  /**
   * Format service request cho hiển thị
   */
  formatServiceRequestForDisplay(serviceRequest: ServiceRequestModel): any {
    return {
      id: serviceRequest.id,
      serviceName: serviceRequest.serviceName,
      cost: this.formatCurrency(serviceRequest.cost),
      status: this.getStatusDisplayText(serviceRequest.status),
      requestedAt: this.formatDate(serviceRequest.requestedAt),
      completedAt: serviceRequest.completedAt ? this.formatDate(serviceRequest.completedAt) : null,
      requestNotes: serviceRequest.requestNotes || 'Không có ghi chú',
      resultNotes: serviceRequest.resultNotes || 'Chưa có kết quả'
    };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  private getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'Đã yêu cầu',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleString('vi-VN');
  }
} 
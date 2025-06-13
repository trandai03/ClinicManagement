import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
  serviceId: number;
  serviceName: string;
  serviceType: 'MEDICAL_SERVICE' | 'LAB_TEST';
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cost: number;
  requestNotes?: string;
  resultNotes?: string;
  requestedAt: Date;
  completedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả service requests theo booking ID
   */
  getAllServiceRequestsByBookingId(bookingId: number): Observable<ServiceRequestModel[]> {
    return this.http.get<ServiceRequestModel[]>(`${this.apiUrl}api/v1/service-request/${bookingId}`);
  }

  /**
   * Tạo service request mới
   */
  createServiceRequest(bookingId: number, serviceRequestDTOs: ServiceRequestDTO[]): Observable<ServiceRequestModel[]> {
    return this.http.post<ServiceRequestModel[]>(`${this.apiUrl}api/v1/service-request/${bookingId}`, serviceRequestDTOs);
  }

  /**
   * Cập nhật service request
   */
  updateServiceRequest(serviceRequestId: number, serviceRequestDTO: ServiceRequestDTO): Observable<ServiceRequestModel> {
    return this.http.put<ServiceRequestModel>(`${this.apiUrl}api/v1/service-request/${serviceRequestId}`, serviceRequestDTO);
  }

  /**
   * Xóa service request
   */
  deleteServiceRequest(serviceRequestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}api/v1/service-request/${serviceRequestId}`);
  }
} 
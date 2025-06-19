import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.dev';

export interface PaymentRequest {
  bookingId: number;
  amount: number;
}

export interface PaymentResponse {
  data: string; // payUrl from MoMo
  message: string;
}

export interface MoMoPaymentResult {
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Tạo thanh toán MoMo cho booking
   */
  createMoMoPayment(bookingId: number,totalAmount: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}api/v1/payments`, null, {
      params: {
        bookingId: bookingId,
        totalAmount: totalAmount
      }
    });
  }

  /**
   * Xử lý kết quả thanh toán từ MoMo callback
   */
  handleMoMoCallback(paymentResult: MoMoPaymentResult): Observable<any> {
    return this.http.post(`${this.apiUrl}api/v1/payments/callback`, paymentResult);
  }

  /**
   * Kiểm tra trạng thái thanh toán của booking
   */
  checkPaymentStatus(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}api/v1/payments/status/${bookingId}`);
  }

  /**
   * Mở trang thanh toán MoMo trong tab mới
   */
  openMoMoPayment(payUrl: string): void {
    window.open(payUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  }

  /**
   * Chuyển đến trang thanh toán MoMo trong cùng tab
   */
  redirectToMoMoPayment(payUrl: string): void {
    window.location.href = payUrl;
  }
}

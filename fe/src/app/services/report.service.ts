import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize } from 'rxjs';
import { environment } from '../environment/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Xuất báo cáo hóa đơn thanh toán
   */
  exportInvoice(historyId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}api/v1/histories/export-invoice/${historyId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Lỗi khi xuất hóa đơn:', error);
        throw error;
      })
    );
  }

  /**
   * Xuất báo cáo đơn thuốc
   */
  exportPrescription(historyId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}api/v1/histories/export-prescription/${historyId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Lỗi khi xuất đơn thuốc:', error);
        throw error;
      })
    );
  }

  /**
   * Xuất báo cáo lịch sử khám bệnh (method hiện có)
   */
  exportHistory(bookingId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}api/v1/histories/exportResult/${bookingId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Lỗi khi xuất lịch sử khám:', error);
        throw error;
      })
    );
  }

  /**
   * Helper method để download file PDF
   */
  downloadPdfFile(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi download file:', error);
      alert('Có lỗi khi tải file PDF. Vui lòng thử lại!');
    }
  }

  /**
   * Xuất hóa đơn với tên file tự động
   */
  downloadInvoice(historyId: number, patientName?: string): void {
    this.exportInvoice(historyId).subscribe({
      next: (blob) => {
        const fileName = `Hoa_don_${patientName ? patientName.replace(/\s+/g, '_') : historyId}_${Date.now()}.pdf`;
        this.downloadPdfFile(blob, fileName);
      },
      error: (error) => {
        console.error('Lỗi khi tải hóa đơn:', error);
        alert('Có lỗi khi tải hóa đơn. Vui lòng thử lại!');
      }
    });
  }

  /**
   * Xuất đơn thuốc với tên file tự động
   */
  downloadPrescription(historyId: number, patientName?: string): void {
    this.exportPrescription(historyId).subscribe({
      next: (blob) => {
        const fileName = `Don_thuoc_${patientName ? patientName.replace(/\s+/g, '_') : historyId}_${Date.now()}.pdf`;
        this.downloadPdfFile(blob, fileName);
      },
      error: (error) => {
        console.error('Lỗi khi tải đơn thuốc:', error);
        alert('Có lỗi khi tải đơn thuốc. Vui lòng thử lại!');
      }
    });
  }

  /**
   * Xuất lịch sử khám với tên file tự động
   */
  downloadHistory(bookingId: number, patientName?: string): void {
    this.exportHistory(bookingId).subscribe({
      next: (blob) => {
        const fileName = `Lich_su_kham_${patientName ? patientName.replace(/\s+/g, '_') : bookingId}_${Date.now()}.pdf`;
        this.downloadPdfFile(blob, fileName);
      },
      error: (error) => {
        console.error('Lỗi khi tải lịch sử khám:', error);
        alert('Có lỗi khi tải lịch sử khám. Vui lòng thử lại!');
      }
    });
  }
} 
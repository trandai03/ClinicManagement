import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }

  // Success toast với custom options
  showSuccess(message: string, title: string = 'Thành công') {
    this.toastr.success(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    });
  }

  // Error toast với custom options
  showError(message: string, title: string = 'Lỗi') {
    this.toastr.error(message, title, {
      timeOut: 6000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    });
  }

  // Warning toast với custom options
  showWarning(message: string, title: string = 'Cảnh báo') {
    this.toastr.warning(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    });
  }

  // Info toast với custom options
  showInfo(message: string, title: string = 'Thông tin') {
    this.toastr.info(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    });
  }

  // Toast cho thao tác thành công (với icon custom)
  showOperationSuccess(operation: string) {
    this.showSuccess(`${operation} thành công!`, 'Hoàn thành');
  }

  // Toast cho lỗi server
  showServerError(error?: any) {
    const message = error?.message || error?.error?.message || 'Đã xảy ra lỗi từ server';
    this.showError(message, 'Lỗi Server');
  }

  // Toast cho validation errors
  showValidationError(message: string = 'Vui lòng kiểm tra lại thông tin đã nhập') {
    this.showWarning(message, 'Dữ liệu không hợp lệ');
  }

  // Toast cho thao tác không được phép
  showUnauthorized(message: string = 'Bạn không có quyền thực hiện thao tác này') {
    this.showWarning(message, 'Không có quyền');
  }

  // Toast cho loading với timeout
  showLoading(message: string = 'Đang xử lý...') {
    return this.toastr.info(message, 'Vui lòng chờ', {
      timeOut: 0, // Không tự động ẩn
      extendedTimeOut: 0,
      progressBar: false,
      closeButton: false,
      tapToDismiss: false,
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    });
  }

  // Clear tất cả toasts
  clearAll() {
    this.toastr.clear();
  }

  // Toast với HTML content
  showHtmlMessage(htmlMessage: string, title: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const options = {
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      enableHtml: true,
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    };

    switch (type) {
      case 'success':
        this.toastr.success(htmlMessage, title, options);
        break;
      case 'error':
        this.toastr.error(htmlMessage, title, options);
        break;
      case 'warning':
        this.toastr.warning(htmlMessage, title, options);
        break;
      default:
        this.toastr.info(htmlMessage, title, options);
    }
  }

  // Toast với action button
  showActionToast(message: string, title: string, actionText: string, callback: () => void) {
    const htmlMessage = `
      ${message}
      <br><br>
      <button class="btn btn-sm btn-outline-light" onclick="window.toastAction()">
        ${actionText}
      </button>
    `;
    
    // Gán callback vào window để có thể gọi từ HTML
    (window as any).toastAction = callback;
    
    this.showHtmlMessage(htmlMessage, title, 'info');
  }
} 
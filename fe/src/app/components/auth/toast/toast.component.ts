import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  constructor(
    private toastr: ToastrService,
    private toastService: ToastService
  ) {}

  showSuccess() {
    this.toastr.success('Success message', 'Success');
  }

  showSuccess1(message: string, title: string) {
    this.toastr.success(message, title);
  }

  showError() {
    this.toastr.error('Error message', 'Error');
  }

  demoCustomSuccess() {
    this.toastService.showSuccess('Dữ liệu đã được lưu thành công!', 'Hoàn thành');
  }

  demoCustomError() {
    this.toastService.showError('Không thể kết nối đến server!', 'Lỗi kết nối');
  }

  demoCustomWarning() {
    this.toastService.showWarning('Vui lòng kiểm tra lại thông tin!', 'Cảnh báo');
  }

  demoCustomInfo() {
    this.toastService.showInfo('Hệ thống sẽ bảo trì vào 2h sáng', 'Thông báo');
  }

  demoOperationSuccess() {
    this.toastService.showOperationSuccess('Tạo tài khoản');
  }

  demoServerError() {
    this.toastService.showServerError({ message: 'Database connection failed' });
  }

  demoValidationError() {
    this.toastService.showValidationError('Email không đúng định dạng');
  }

  demoUnauthorized() {
    this.toastService.showUnauthorized();
  }

  demoHtmlMessage() {
    this.toastService.showHtmlMessage(
      '<strong>Chúc mừng!</strong><br/>Bạn đã đăng ký thành công.<br/><small>Kiểm tra email để kích hoạt tài khoản</small>',
      'Đăng ký thành công',
      'success'
    );
  }

  demoActionToast() {
    this.toastService.showActionToast(
      'Bạn có muốn hoàn tác thao tác vừa rồi?',
      'Xác nhận',
      'Hoàn tác',
      () => {
        this.toastService.showInfo('Đã hoàn tác thành công!');
      }
    );
  }

  demoLoading() {
    const loadingToast = this.toastService.showLoading('Đang tải dữ liệu...');
    
    setTimeout(() => {
      this.toastr.clear(loadingToast.toastId);
      this.toastService.showSuccess('Tải dữ liệu thành công!');
    }, 3000);
  }

  clearAllToasts() {
    this.toastService.clearAll();
  }

  demoMultipleToasts() {
    setTimeout(() => this.toastService.showInfo('Toast 1: Bắt đầu xử lý'), 0);
    setTimeout(() => this.toastService.showWarning('Toast 2: Đang kiểm tra dữ liệu'), 500);
    setTimeout(() => this.toastService.showSuccess('Toast 3: Hoàn thành!'), 1000);
  }

  demoPositions() {
    this.toastr.success('Top Right', 'Vị trí 1', {
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast'
    });

    setTimeout(() => {
      this.toastr.info('Top Left', 'Vị trí 2', {
        positionClass: 'toast-top-left',
        toastClass: 'ngx-toastr custom-toast'
      });
    }, 500);

    setTimeout(() => {
      this.toastr.warning('Bottom Right', 'Vị trí 3', {
        positionClass: 'toast-bottom-right',
        toastClass: 'ngx-toastr custom-toast'
      });
    }, 1000);
  }
}

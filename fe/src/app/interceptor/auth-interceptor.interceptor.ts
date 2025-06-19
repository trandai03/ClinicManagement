import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { storageUtils } from '../utils/storage';
import { Router } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../services/toast.service';

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService, private toastService: ToastService) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      setHeaders: {
        Authorization : `Bearer ${(storageUtils.get('jwt'))}`
      }
    })
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Xử lý lỗi 401 - Token hết hạn hoặc không hợp lệ
        if (error.status === 401) {
          this.handleUnauthorized();
        }
        // Ném lại lỗi để component xử lý
        throw error;
      })
    );
  }

  private handleUnauthorized(): void {
    // Clear storage
    storageUtils.clear();
    
    // Hiển thị thông báo
    this.toastService.showWarning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Cảnh báo');
    
    // Điều hướng về trang login
    this.router.navigate(['/login']);
  }
}

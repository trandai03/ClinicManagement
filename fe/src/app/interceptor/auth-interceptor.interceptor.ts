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
    const token = storageUtils.get('jwt');
    
    // Chỉ thêm Authorization header nếu có token
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Xử lý lỗi 401 - Token hết hạn hoặc không hợp lệ
        if (error.status === 401 && token) {
          // Kiểm tra xem có đang ở trang login hoặc public không
          const currentUrl = this.router.url;
          const isPublicRoute = currentUrl.includes('/public') || currentUrl.includes('/login') || currentUrl.includes('/register');
          
          // Chỉ clear session nếu không phải public route
          if (!isPublicRoute) {
            this.handleUnauthorized();
          } else {
            console.log('🟡 401 on public route - not clearing session');
          }
        }
        // Ném lại lỗi để component xử lý
        throw error;
      })
    );
  }

  private handleUnauthorized(): void {
    console.log('🔴 401 Unauthorized - Token expired, clearing session');
    
    // Clear storage
    storageUtils.clear();
    
    // Hiển thị thông báo
    this.toastService.showWarning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Cảnh báo');
    
    // Điều hướng về trang login
    this.router.navigate(['/login']);
  }
}

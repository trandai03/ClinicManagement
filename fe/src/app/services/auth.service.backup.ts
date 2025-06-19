import { Injectable } from '@angular/core';
import { Doctor } from '../models/doctor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, reduce, switchMap, tap } from 'rxjs';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';
import { Router } from '@angular/router';
import { storageUtils } from '../utils/storage';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private route: Router, private toastSv: ToastrService) { }

  // ========== LOGIN ==========
  login(username: string, password: string) {
    return this.http.post<apiResponse<any>>(environment.apiBaseUrl + 'auth/login', { username, password }).pipe(
      switchMap((res) => {
        if (res.status === 'success') {
          storageUtils.clear()
          storageUtils.set('jwt', res.data.accessToken);
          storageUtils.set('roleId', res.data.roleId);
          storageUtils.set('userId', res.data.userId);
          storageUtils.set('fullName', res.data.fullName);
          storageUtils.set('profile', res.data.profile);
          // Điều hướng theo role
          
          this.navigateByRole(res.data.roleId);
          
        }
        return of(null);
      }),
      catchError((res) => {
        this.toastSv.error('Thông tin đăng nhập không chính xác', 'Lỗi')
        return of(null)
      })
    )
  }

  // ========== REGISTER ==========
  // Đăng ký user mới với email hoặc phone
  registerUser(userData: any): Observable<apiResponse<any>> {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/register`, userData);
  }

  // Xác thực OTP
  verifyOTP(contactMethod: string, otp: string): Observable<apiResponse<any>> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactMethod);
    const verifyData = {
      email: isEmail ? contactMethod : null,
      phone: !isEmail ? contactMethod : null,
      otp: otp
    };
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/verify-otp`, verifyData);
  }

  // Gửi lại OTP
  resendOTP(contactData: any): Observable<apiResponse<any>> {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/resend-otp`, contactData);
  }

  // Phương thức cũ cho đăng nhập bằng gmail (giữ lại để tương thích)
  registerUserOld(gmail: string) {
    return this.http.post<any>(`${this.apiUrl}api/v1/user`, { gmail });
  }

  // Xác thực captcha cũ (giữ lại để tương thích)
  validateCapcha(gmail: string, captcha: string) {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/validate-captcha`, { gmail, captcha }).pipe(
      switchMap((res) => {
        if (res.status === 'success') {
          storageUtils.clear()
          storageUtils.set('jwt', res.data.accessToken);
          storageUtils.set('roleId', res.data.roleId);
          storageUtils.set('userId', res.data.userId);
          storageUtils.set('profile', res.data.profile);
          window.location.href = 'public/profile';
        }
        return of(null);
      }),
      catchError((res) => {
        this.toastSv.error('Mã xác thực không chính xác', 'Lỗi')
        return of(null)
      })
    );
  }

  // Lưu profile
  saveProffile(profile: any) {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/profile`, profile).pipe(
      switchMap((res) => {
        storageUtils.set('profile', res);
        this.toastSv.success('Cập nhật thành công', 'Thành công')
        return of(null);
      }),
      catchError((res) => {
        this.toastSv.error('Đã xảy ra lỗi', 'Lỗi')
        return of(null)
      })
    );
  }

  // ========== LOGOUT ==========
  logout() {
    const token = storageUtils.get('jwt');
    if (token) {
      return this.http.get(`${environment.apiBaseUrl}api/v1/logout?token=${token}`).pipe(
        switchMap(() => {
          this.clearSession();
          return of(null);
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
    } else {
      this.clearSession();
      return of(null);
    }
  }

  private clearSession() {
    storageUtils.clear();
    this.route.navigate(['public/trang-chu']);
  }

  // ========== UTILITY METHODS ==========
  isLogin(): boolean {
    if (!storageUtils.get('jwt')) {
      return false;
    }
    return true;
  }

  getCurrentRole(): string | null {
    return storageUtils.get('roleId');
  }

  getCurrentUserId(): string | null {
    return storageUtils.get('userId');
  }

  getCurrentUserName(): string | null {
    return storageUtils.get('fullName');
  }

  // Kiểm tra role hiện tại
  isAdmin(): boolean {
    return this.getCurrentRole() === '1';
  }

  isDoctor(): boolean {
    return this.getCurrentRole() === '2';
  }

  isClient(): boolean {
    return this.getCurrentRole() === '3';
  }

  // Điều hướng theo role
  private navigateByRole(roleId: string): void {
    switch (roleId) {
      case '1': // Admin
        this.route.navigate(['admin']);
        break;
      case '2': // Doctor
        this.route.navigate(['doctor']);
        break;
      case '3': // Client
        window.location.href = '/public/trang-chu';
        break;
      default:
        this.route.navigate(['public/trang-chu']);
        break;
    }
  }

  // Điều hướng thủ công theo role
  navigateToRoleDashboard(): void {
    const roleId = this.getCurrentRole();
    if (roleId) {
      this.navigateByRole(roleId);
    } else {
      this.route.navigate(['public/trang-chu']);
    }
  }
}

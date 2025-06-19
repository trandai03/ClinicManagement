import { Injectable } from '@angular/core';
import { Doctor } from '../models/doctor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, reduce, switchMap, tap, BehaviorSubject } from 'rxjs';
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
  
  // Subject để thông báo khi user login
  private userLoginSubject = new BehaviorSubject<any>(null);
  public userLogin$ = this.userLoginSubject.asObservable();

  constructor(private http: HttpClient, private route: Router, private toastSv: ToastrService) { 
    // Khởi tạo với data hiện tại trong storage
    const currentUser = {
      roleId: storageUtils.get('roleId'),
      userId: storageUtils.get('userId'),
      fullName: storageUtils.get('fullName'),
      profile: storageUtils.get('profile')
    };
    if (currentUser.roleId) {
      this.userLoginSubject.next(currentUser);
    }
  }

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
          
          // Thông báo user đã login
          this.userLoginSubject.next({
            roleId: res.data.roleId,
            userId: res.data.userId,
            fullName: res.data.fullName,
            profile: res.data.profile
          });
          
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
  // validateCapcha(gmail: string, captcha: string) {
  //   return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/validate-captcha`, { gmail, captcha }).pipe(
  //     switchMap((res) => {
  //       if (res.status === 'success') {
  //         storageUtils.clear()
  //         storageUtils.set('jwt', res.data.accessToken);
  //         storageUtils.set('roleId', res.data.roleId);
  //         storageUtils.set('userId', res.data.userId);
  //         storageUtils.set('profile', res.data.profile);
  //         window.location.href = 'public/profile';
  //       }
  //       return of(null);
  //     }),
  //     catchError((res) => {
  //       this.toastSv.error('Mã xác thực không chính xác', 'Lỗi')
  //       return of(null)
  //     })
  //   );
  // }

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
    this.userLoginSubject.next(null);
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
    console.log('navigateByRole'+ roleId);
    switch (roleId) {
      case '1': // Admin
        this.route.navigate(['admin']);
        break;
      case '2': // Doctor
        this.route.navigate(['doctor']);
        break;
      case '3': // Client
        this.route.navigate(['public/trang-chu']);
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

  // ========== TOKEN MANAGEMENT ==========
  // Kiểm tra token có hết hạn không
  isTokenExpired(): boolean {
    const token = storageUtils.get('jwt');
    if (!token) return true;
    
    try {
      // Giải mã token để lấy expiration time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // Token hết hạn nếu thời gian hiện tại > thời gian expiration
      return now >= exp;
    } catch (e) {
      return true; // Nếu không thể parse token thì coi như hết hạn
    }
  }

  // Kiểm tra token sắp hết hạn (còn 30 phút)
  isTokenExpiringSoon(): boolean {
    const token = storageUtils.get('jwt');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000; // 30 phút
      
      return (exp - now) <= thirtyMinutes;
    } catch (e) {
      return true;
    }
  }

  // Refresh token (có thể implement sau nếu backend hỗ trợ)
  refreshToken(): Observable<any> {
    const token = storageUtils.get('jwt');
    return this.http.post<apiResponse<any>>(`${this.apiUrl}auth/refresh`, { token }).pipe(
      switchMap((res) => {
        if (res.status === 'success') {
          storageUtils.set('jwt', res.data.accessToken);
        }
        return of(res);
      }),
      catchError((error) => {
        // Nếu refresh failed, logout
        this.logout().subscribe();
        return of(null);
      })
    );
  }
}

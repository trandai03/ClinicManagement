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

  constructor(private http : HttpClient,private route : Router,private toastSv: ToastrService) { }

  login(username: string, password: string){
    return this.http.post<apiResponse<any>>(environment.apiBaseUrl+'auth/login',{username,password}).pipe(
      switchMap((res) => {
        if (res.status === 'success') {
          storageUtils.clear()
            storageUtils.set('jwt',res.data.accessToken);
            storageUtils.set('roleId',res.data.roleId);
            storageUtils.set('userId',res.data.userId);
            storageUtils.set('fullName',res.data.fullName);
            if(res.data.roleId == '1') this.route.navigate(['admin'])
            else this.route.navigate(['doctor'])
        }
        return of(null);
      }),
      catchError((res) => {
        this.toastSv.error('Mã xác thực không chính xác', 'Error')
        return of(null)
      })
      )
  }

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

  isLogin(){
    if(!storageUtils.get('jwt')){
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
}

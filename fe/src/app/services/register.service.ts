import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment.dev';
import { catchError, of, switchMap } from 'rxjs';
import { storageUtils } from '../utils/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http : HttpClient,private route : Router, private toastSv: ToastrService) { }

  registerUser(gmail: string){
    return this.http.post<any>(`${this.apiUrl}api/v1/user`, {gmail});
  }

  validateCapcha(gmail: string , captcha :string){
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/validate-captcha`, {gmail, captcha}).pipe(
            switchMap((res) => {
              if(res.status==='success'){
                storageUtils.clear()
                storageUtils.set('jwt',res.data.accessToken);
                storageUtils.set('roleId',res.data.roleId);
                storageUtils.set('userId',res.data.userId);
                storageUtils.set('profile',res.data.profile);
                window.location.href='public/profile';
              }
              return of(null);
            }),
            catchError((res) => {
              this.toastSv.error('Mã xác thực không chính xác', 'Error')
              return of(null)
            })
          );
  }

  saveProffile(profile: any) {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/profile`, profile).pipe(
      switchMap((res) => {
        storageUtils.set('profile',res);
        this.toastSv.success('Cập nhật thành công', 'Success')
        return of(null);
      }),
      catchError((res) => {
        this.toastSv.error('Đã xảy ra lỗi', 'Error')
        return of(null)
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Doctor } from '../models/doctor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, reduce, switchMap, tap } from 'rxjs';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';
import { Router } from '@angular/router';
import { storageUtils } from '../utils/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient,private route : Router) { }

  login(username: string, password: string){
    return this.http.post<apiResponse<any>>(environment.apiBaseUrl+'auth/login',{username,password}).pipe(
        switchMap((res) => {
          if(res.status==='success'){
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
          alert('Tài khoản hoặc mật khẩu không chính xác')
          return of(null)
        })
      )
  }



  isLogin(){
    if(!storageUtils.get('jwt')){
      this.route.navigate(['login'])
      return false;
    }
    return true;
  }
}

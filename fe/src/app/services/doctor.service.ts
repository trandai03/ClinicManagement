import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Doctor } from '../models/doctor';
import { apiResponse } from '../models/apiResponse';
import { environment } from '../environment/environment.dev';
import { storageUtils } from '../utils/storage';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAllDoctors(status: string): Observable<Doctor[]> {
    return this.http
      .get<apiResponse<Doctor[]>>(
        `${this.apiUrl}api/v1/doctors?status=${status}`
      )
      .pipe(
        map((e) => {
          console.log(e);
          return e.data;
        })
      );
  }

  getAllDoctorByMajor(
    id: number | null,
    status: string,
    idMajor: number | null,
    name: string | null
  ): Observable<Doctor[]> {
    const id1 = id == null ? '' : `id=${id}`;
    const idMajor1 = idMajor == null ? '' : `&majorId=${idMajor}`;
    const name1 = name == '' || name == null ? '' : `&name=${name}`;
    const giatri = `${this.apiUrl}api/v1/doctors?${id1}${idMajor1}&status=${status}${name1}`;
    console.log(giatri);
    return this.http.get<apiResponse<Doctor[]>>(giatri).pipe(
      map((e) => {
        console.log('gai ne: ' + e);
        return e.data;
      })
    );
  }

  getDoctorById(id: string) {
    return this.http
      .get<apiResponse<any>>(`${this.apiUrl}api/v1/doctor/${id}`)
      .pipe(
        map((e) => {
          console.log('gia tri data:  ', e.data);
          return e.data;
        })
      );
  }

  createDoctor(formdata: FormData): Observable<apiResponse<any>> {
    return this.http.post<apiResponse<any>>(
      `${this.apiUrl}api/v1/doctor`,
      formdata
    );
  }

  updateDoctor(formdata: FormData, id: number) {
    return this.http.put<apiResponse<any>>(
      `${this.apiUrl}api/v1/doctor/${id}`,
      formdata
    );
  }

  delete(id: number): Observable<apiResponse<any>> {
    return this.http.delete<apiResponse<any>>(
      `${this.apiUrl}api/v1/doctor/${id}`
    );
  }

  restoreStatus(id: number) {
    return this.http.get<apiResponse<any>>(
      `${this.apiUrl}api/v1/restore-status/${id}`
    );
  }

  resetPassword(id: number, gmail: String) {
    return this.http.get<apiResponse<any>>(
      `${this.apiUrl}api/v1/reset-pass/${id}?gmail=${gmail}`
    );
  }

  changPass(id: number, username: string, password: string) {
    return this.http.post<apiResponse<any>>(
      `${this.apiUrl}api/v1/change-pass/${id}`,
      { username, password }
    );
  }

  logout() {
    const token = storageUtils.get('jwt');
    return this.http.get(`${this.apiUrl}api/v1/logout?token=${token}`);
  }
}

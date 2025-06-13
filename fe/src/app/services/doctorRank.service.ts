import { Injectable } from '@angular/core';
import { Observable, catchError, delay, map, of } from 'rxjs';
import { DoctorRank, DoctorRankDTO } from '../models/doctorRank';
import { environment } from '../environment/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class DoctorRankService {

  apiUrl = environment.apiBaseUrl;  

  constructor(private http : HttpClient) { }


  getAllDoctorRanks() : Observable<DoctorRank[]> {
    return this.http.get<apiResponse<DoctorRank[]>>(`${this.apiUrl}api/v1/doctor-ranks`).pipe(
      map( e =>{
        console.log("e", e);
        return e.data;
      })
    )
  }

  getDoctorRankByName(keyword : string) {
    return this.http.get<apiResponse<DoctorRank[]>>(`${this.apiUrl}api/v1/doctor-ranks?name=${keyword}`).pipe(
      map(e => e.data)
    )
  }

  createDoctorRank(formdata : FormData) : Observable<apiResponse<any>> {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/doctor-rank`,formdata, );
  }

  createDoctorRankJSON(doctorRank: DoctorRank) : Observable<apiResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/doctor-ranks`, doctorRank, { headers });
  }

  updateDoctorRank(formdata : FormData, id : number) {
    return this.http.put<apiResponse<any>>(`${this.apiUrl}api/v1/doctor-rank/${id}`,formdata)
  }

  updateDoctorRankJSON(doctorRank: DoctorRank, id : number) : Observable<apiResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<apiResponse<any>>(`${this.apiUrl}api/v1/doctor-ranks/${id}`, doctorRank, { headers });
  }

  delete(id : number ) : Observable<apiResponse<any>> {
    return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/doctor-ranks/${id}`);
  }
}

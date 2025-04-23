import { Injectable } from '@angular/core';
import { Observable, catchError, delay, map, of } from 'rxjs';
import { Major, MajorDTO, majors } from '../models/major';
import { environment } from '../environment/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class MajorService {

  apiUrl = environment.apiBaseUrl;  

  constructor(private http : HttpClient) { }


  getAllMajors() : Observable<Major[]> {
    return this.http.get<apiResponse<Major[]>>(`${this.apiUrl}api/v1/majors`).pipe(
      map( e => e.data)
    )
  }

  getMajorByName(keyword : string) {
    return this.http.get<apiResponse<Major[]>>(`${this.apiUrl}api/v1/majors?name=${keyword}`).pipe(
      map(e => e.data)
    )
  }

  createMajor(formdata : FormData) : Observable<apiResponse<any>> {
    return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/major`,formdata, );
  }

  updateMajor(formdata : FormData, id : number) {
    return this.http.put<apiResponse<any>>(`${this.apiUrl}api/v1/major/${id}`,formdata)
  }


  delete(id : number ) : Observable<apiResponse<any>> {
    return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/major/${id}`);
  }
}

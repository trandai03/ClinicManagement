import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from '../environment/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  apiUrl = environment.apiBaseUrl;  

  constructor(private http : HttpClient) { }


  getAllHistories() : Observable<any[]> {
    return this.http.get<apiResponse<any[]>>(`${this.apiUrl}api/v1/articles`).pipe(
      map( e => {
        console.log(e)
        return e.data
      })
    )
  }

  getHistory(keyword : string) {
    return this.http.get<apiResponse<any[]>>(`${this.apiUrl}api/v1/histories?name=${keyword}`).pipe(
      map(e => e.data)
    )
  }

  saveHistory(history : any) {
    return this.http.post<any>(`${this.apiUrl}api/v1/histories`,history );
  }

  exportHistory(id : number) {
    return this.http.get<any>(`${this.apiUrl}api/v1/histories/exportResult/${id}`, { responseType: 'blob' as 'json' });
  }
}

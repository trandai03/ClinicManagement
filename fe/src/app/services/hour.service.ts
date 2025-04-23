import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { Major, majors } from '../models/major';
import { Contact, contacts } from '../models/contact';
import { Article, articles } from '../models/article';
import { environment } from '../environment/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiResponse } from '../models/apiResponse';
import { Hour } from '../models/hour';

@Injectable({
  providedIn: 'root'
})
export class HourService {

  apiUrl = environment.apiBaseUrl;  

  constructor(private http : HttpClient) { }


  getAllHour() : Observable<Hour[]> {
    return this.http.get<apiResponse<Hour[]>>(`${this.apiUrl}api/v1/hours`).pipe(
      map( e => {
        console.log(e)
        return e.data
      })
    )
  }
}
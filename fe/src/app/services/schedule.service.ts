import { Injectable } from '@angular/core';
import { Schedule, Schedules, schedules } from '../models/schedule';
import { Observable, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  apiUrl = environment.apiBaseUrl;
  constructor(private http : HttpClient) {}

  getAllSchedule(): Observable<Schedule[]> {
    return of(schedules);
  }

  getAllScheduleByIdDoctor(id : string) {
    return this.http.get<apiResponse<Schedules[]>>(`${this.apiUrl}api/v1/schedule?idDoctor=${id}`).pipe(
      map(e => e.data)
    )
  }
}

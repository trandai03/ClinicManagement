import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExaminationStartDTO, ExaminationCompletionDTO } from '../models/examination.dto';

@Injectable({
  providedIn: 'root'
})
export class ExaminationService {
  private apiUrl = 'http://localhost:8080/api/v1/examination';

  constructor(private http: HttpClient) {}

  startExamination(bookingId: number, startData: ExaminationStartDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/start/${bookingId}`, startData);
  }

  completeExamination(completionData: ExaminationCompletionDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/complete`, completionData);
  }

  getBookingDetails(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking/${bookingId}`);
  }
} 
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Major, majors } from '../models/major';
import { Contact, contacts } from '../models/contact';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class MedicalServiceService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAllMedicalService(): Observable<any> {
    return this.http.get<apiResponse<any>>(`${this.apiUrl}api/v1/medicalService`);
  }

  createMedicalService(name: string, money: number, description: string) {
    return this.http.post(`${this.apiUrl}api/v1/medicalService`, {
      name,
      money,
      description
    });
  }

  updateMedicalService(id: number, name: string, money: number, description: string) {
    return this.http.put(`${this.apiUrl}api/v1/medicalService/${id}`, {
      name,
      money,
      description
    });
  }

  deleteMedicalService(id: number) {
    return this.http.delete(`${this.apiUrl}api/v1/medicalService/${id}`);
  }
}

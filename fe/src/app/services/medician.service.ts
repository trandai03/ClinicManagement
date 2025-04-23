import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Major, majors } from '../models/major';
import { Contact, contacts } from '../models/contact';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment.dev';
import { apiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http : HttpClient) { }

  getAllMedicine() : Observable<any> {
    return this.http.get<apiResponse<any>>(`${this.apiUrl}api/v1/medicines`);
  }

  // name, quantity, money, description, unit = (VI,VIEN)
  createMedicine(name:string,quantity:number,money:number,description:string,unit:string) {
    return this.http.post(`${this.apiUrl}api/v1/medicines/add`,{name,quantity,money,description,unit});
  }

  deleteMedicine(id : number) {
    return this.http.delete(`${this.apiUrl}api/v1/medicines/${id}`);
  }

  // Update an existing medicine
  updateMedicine(id: number, name: string, quantity: number, money: number, description: string, unit: string) {
    return this.http.put(`${this.apiUrl}api/v1/medicines/${id}`, {name, quantity, money, description, unit});
  }

}

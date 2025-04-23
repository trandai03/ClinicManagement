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
export class ContactService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http : HttpClient) { }

  getAllContact() : Observable<any> {
    return this.http.get<apiResponse<any>>(`${this.apiUrl}api/v1/contacts`);
  }

  createContact(name:string,dob:string,phone:string,email:string,note:string) {
    return this.http.post(`${this.apiUrl}api/v1/contact`,{name,dob,phone,email,note});
  }

  deleteContact(id : number) {
    return this.http.delete(`${this.apiUrl}api/v1/contact/${id}`);
  }
  
}

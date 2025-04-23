import { Injectable } from "@angular/core";
import { Booking, BookingDTO } from "../models/booking";
import { Observable, delay, map, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environment/environment.dev";
import { apiResponse } from "../models/apiResponse";




@Injectable({
    providedIn: 'root'
  })
  export class BookingService {
  
    apiUrl = environment.apiBaseUrl;
    constructor(private http: HttpClient) { }
  
    getAllBooking(param : string, idDoctor : string | null, start : string | null, end : string | null, email : string | null) : Observable<Booking[]> {
      let st = '', en = '',id = ''
      if(start != null && start != '') st =  '&start=' + start;
      if(end != null && end != '') en = '&end=' + end;
      if(idDoctor != null && idDoctor != '') id = '&idDoctor='+ idDoctor;
      if(email != null && email != '') id = '&email='+ email;
      const s = `${this.apiUrl}api/v1/bookings?status=${param}${st}${en}${id}`
      console.log(s)
      return this.http.get<apiResponse<any>>(s).pipe(
        map(e =>e.data )
      )
    }

    createBooking(name:string,dob:string,phone:string,email:string,gender:string,address:string,idMajor:string,
      idUser:string,date:string,idHour:string,note:string) {
        const s = {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note};
        console.log('Gia tri json : ')
        console.log(s)
      return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/booking`,
      {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note});
    }

    updateBooking(id: number, status : string) {
      return this.http.post<apiResponse<any>>(`${this.apiUrl}api/v1/booking/${id}`, {status});
    }

    delete(id : number) {
      return this.http.delete<apiResponse<any>>(`${this.apiUrl}api/v1/booking/${id}`);
    }
  }
  
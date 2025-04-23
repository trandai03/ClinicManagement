import { Injectable } from "@angular/core";
import { Notification, notifications } from "../models/notification";
import { Observable, of } from "rxjs";




@Injectable({
    providedIn: 'root',
  })
  export class NotifiService {
    constructor() {}
  
    getAllNotifi(): Observable<Notification[]> {
      return of(notifications);
    }
  }


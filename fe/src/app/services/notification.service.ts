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

  getUnreadCount(userId: string): Observable<number> {
    // TODO: Implement actual API call
    return of(notifications.filter(n => !n.isRead).length);
  }

  markAsRead(notificationId: number): Observable<boolean> {
    // TODO: Implement actual API call
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    return of(true);
  }

  markAllAsRead(userId: string): Observable<boolean> {
    // TODO: Implement actual API call
    notifications.forEach(n => n.isRead = true);
    return of(true);
  }
}


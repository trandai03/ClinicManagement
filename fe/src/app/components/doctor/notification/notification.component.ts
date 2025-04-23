import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from 'src/app/models/notification';
import { NotifiService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  lnotifi!: Observable<Notification[]>;

  constructor(private notifiSv: NotifiService){};

  ngOnInit() {
    this.lnotifi = this.notifiSv.getAllNotifi();
    this.lnotifi.subscribe();
  }
}

import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  idcho = 0;
  idsap = 0;
  constructor(private bookingsv : BookingService){}
  ngOnInit() {
    let date = new Date();
    let st = formatDate(date, 'dd/MM/yyyy', 'en-US')
    this.bookingsv.getAllBooking('ACCEPTING',storageUtils.get('userId') || null,st,st,null).subscribe(res =>{
      console.log('da chay: ', res)
      this.idsap = res.length;
    })
    this.bookingsv.getAllBooking('CONFIRMING',storageUtils.get('userId') || null,st,st,null).subscribe(res =>{
      this.idcho = res.length;
    })
  }
}

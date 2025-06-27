import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Booking } from 'src/app/models/booking';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  lbooking : any;
  dtTrigger : Subject<any> = new Subject()
  dtOption : DataTables.Settings = {}

  itemout: Booking={
    id: 0,
    name: '',
    gender: '',
    dob: '',
    date: '',
    idHour: 0,
    status: '',
    note: '',
    nameDoctor: '',
    major: '',
    email: '',
    phone: '',
    totalMoney: 0
  };
  constructor(private bookingSv: BookingService){};

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers'
    }
    this.bookingSv.getAllBooking('SUCCESS',null,null,null,null).subscribe(res => {
      this.lbooking = res;
      this.dtTrigger.next(null)
    })
  }

  xem(item : Booking) {
    this.itemout = item;
  }
  formatDate(date: string): string {
    if (!date) return '';
    try {
      let dateObj: Date;
      if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        dateObj = new Date(date);
      }
      return dateObj.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  }
}

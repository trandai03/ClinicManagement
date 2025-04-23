import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { Booking } from 'src/app/models/booking';
import { Hours } from 'src/app/models/hour';
import { BookingService } from 'src/app/services/booking.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent {
  lbooking: any;
  hours = Hours;
  dtTrigger: Subject<any> = new Subject()
  dtOption: DataTables.Settings = {}
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  itemout: Booking = {
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
    phone: ''
  };
  constructor(private bookingSv: BookingService) { };


  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers'
    }
    this.bookingSv.getAllBooking('CONFIRMING', storageUtils.get('userId') || null, null, null,null).subscribe(res => {
      this.lbooking = res;
      this.dtTrigger.next(null)
    })
  }

  xem(item: Booking) {
    this.itemout = item;
  }

  loaddata() {
    this.bookingSv.getAllBooking('CONFIRMING', storageUtils.get('userId') || null, null, null,null).subscribe(res => {
      this.lbooking = res;
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
    })
    
  }

  xacnhan(id: number) {
    this.bookingSv.updateBooking(id, 'ACCEPTING').subscribe({
      next: (value) => {
        this.lbooking = value;
        this.loaddata();
        alert('Đã xác nhận thành công')
      },
      error(err) {
        alert('Đã xảy ra khi xác nhận')
      },
    })
  }
  huy(id: number) {
    this.bookingSv.delete(id).subscribe({
      next : (value)=> {
        this.loaddata();
        alert('Đã hủy thành công')
      },
      error(err) {
          alert('có lỗi: ' + err)
      },
    })
  }
}

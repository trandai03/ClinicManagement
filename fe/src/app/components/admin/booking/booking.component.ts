import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Booking } from 'src/app/models/booking';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent {
  lbooking!: any;
  dtoption : DataTables.Settings = {}
  dtTrigger: Subject<any> = new Subject()

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
    phone: ''
  };
  constructor(
    private bookingSv: BookingService,
    private toastr: ToastrService
  ){};

  ngOnInit() {
    this.dtoption = {
      pagingType: 'full_numbers'
    }
    this.loaddata()
  }

  loaddata() {
    this.bookingSv.getAllBooking('PENDING',null,null,null,null).subscribe(res => {
      this.lbooking = res;
      this.dtTrigger.next(null)
    })
    
  }

  xem(item : Booking) {
    this.itemout = item;
  }

  xoa(id : number){
    this.bookingSv.delete(id).subscribe({
      next:(value) =>{
          this.loaddata();
          this.toastr.success("Xóa thành công", 'Thành công');
      },
      error: (err) => {
          this.toastr.error(err.message, 'Lỗi');
      },
    })
  }
}

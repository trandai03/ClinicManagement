import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Booking } from 'src/app/models/booking';
import { Hours } from 'src/app/models/hour';
import { BookingService } from 'src/app/services/booking.service';
import { HistoryService } from 'src/app/services/history.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-completed-examinations',
  templateUrl: './completed-examinations.component.html',
  styleUrls: ['./completed-examinations.component.css']
})
export class CompletedExaminationsComponent {
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
  
  constructor(
    private bookingSv: BookingService, 
    private historySv: HistoryService,
    private toastr: ToastrService
  ) { };

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers'
    }
    this.bookingSv.getAllBooking('SUCCESS', storageUtils.get('userId') || null, null, null, null).subscribe(res => {
      this.lbooking = res;
      this.dtTrigger.next(null)
    })
  }

  xem(item: Booking) {
    this.itemout = item;
  }

  loaddata() {
    this.bookingSv.getAllBooking('SUCCESS', storageUtils.get('userId') || null, null, null, null).subscribe(res => {
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
        this.toastr.success('Đã xác nhận thành công', 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Đã xảy ra lỗi: ' + err, 'Lỗi');
      },
    })
  }
  
  huy(id: number) {
    this.bookingSv.delete(id).subscribe({
      next: (value) => {
        this.loaddata();
        this.toastr.success('Đã hủy thành công', 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Có lỗi: ' + err, 'Lỗi');
      },
    })
  }

  exportResult(id: number) {
    this.historySv.exportHistory(id).subscribe({
      next: (res) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Hoa_don_kham_benh.pdf'; // Tên file mong muốn
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        this.toastr.success('Đã xuất hóa đơn thành công', 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Có lỗi khi xuất hóa đơn: ' + err, 'Lỗi');
      }
    })
  }
}

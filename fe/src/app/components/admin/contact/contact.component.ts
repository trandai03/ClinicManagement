import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Contact } from 'src/app/models/contact';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  lcontact : any;
  dtOption: DataTables.Settings = {}
  dtTrigger : Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, {static: false})
  dtElement!: DataTableDirective;

  itemout: Contact={
    id: 0,
    dob: '',
    name: '',
    note: '',
    gmail: '',
    phone: ''
  };
  constructor(
    private contactSv: ContactService,
    private toastr: ToastrService
  ){};

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers'
    }
    this.contactSv.getAllContact().subscribe(res => {
      console.log('gia tri nay: ', res)
      this.lcontact = res.data;
      this.dtTrigger.next(null);
    })
    
  }

  xem(item : Contact) {
    this.itemout = item;
  }

  loaddata() : void{
    this.contactSv.getAllContact().subscribe(res => {
      this.lcontact = res;
    });
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
  }

  xoa(id : number) {
    this.contactSv.deleteContact(id).subscribe({
      next : (value) => {
          this.loaddata();
          this.toastr.success('Đã xóa thành công', 'Thành công');
      },
      error: (err) => {
          this.toastr.error('Đã xảy ra lỗi', 'Lỗi');
      },
    })
  }
}

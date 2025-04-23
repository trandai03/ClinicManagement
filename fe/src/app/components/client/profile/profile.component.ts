import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { RegisterService } from 'src/app/services/register.service';
import { storageUtils } from 'src/app/utils/storage';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  ldakham: any;
  lsaptoi: any;

  dtOption: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective, { static: false })
    dtElement!: DataTableDirective;

  profileForm!:FormGroup

  constructor(private formbuilder: FormBuilder,private registerSv: RegisterService, private bookingSv: BookingService) {
    var pro = storageUtils.get('profile');
    this.profileForm = this.formbuilder.group({
      fullName: [pro.fullName || ''],
      dob: [formatDate(new Date(pro.dob), 'dd/MM/yyyy', 'en-US') || ''],
      gender: [pro.gender || ''],
      phone: [pro.phone || ''],
      bhyt: [pro.bhyt || ''],
      address: [pro.address || ''],
    });

    this.bookingSv.getAllBooking('SUCCESS',null,null,null,pro.gmail).subscribe(res => {
      this.ldakham = res;
      this.dtTrigger.next(null)
    });

    this.bookingSv.getAllBooking('ACCEPTING', null, formatDate(new Date(), 'dd/MM/yyyy', 'en-US'), null, pro.gmail).subscribe(res => {
      this.lsaptoi = res;
      this.dtTrigger.next(null)
    })
  }

  ngOnInit(){
    this.dtOption = {
      pagingType: 'full_numbers',
    };
  }

  checkClick: number = 1;

  clickTab(num : number) {
    this.checkClick = num;

    if (this.checkClick === 2) {
      this.bookingSv.getAllBooking('ACCEPTING',null,formatDate(new Date(), 'dd/MM/yyyy', 'en-US') ,null, storageUtils.get('profile').gmail).subscribe(res => {
        this.lsaptoi = res;

        // Làm mới DataTables
        if (this.dtElement && this.dtElement.dtInstance) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy(); // Hủy DataTables cũ
            this.dtTrigger.next(null); // Kích hoạt lại DataTables
          });
        }
      });
    }

    if (this.checkClick === 3) {
      this.bookingSv.getAllBooking('SUCCESS', null, null, null, storageUtils.get('profile').gmail).subscribe(res => {
        this.ldakham = res;

        // Làm mới DataTables
        if (this.dtElement && this.dtElement.dtInstance) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy(); // Hủy DataTables cũ
            this.dtTrigger.next(null); // Kích hoạt lại DataTables
          });
        }
      });
    }
  }

  onSubmit() {
    if(this.profileForm.valid) {
      let {fullName,dob,gender,phone,bhyt,address} = this.profileForm.value;
      let dobformat = ''
      if(dob != '') {
      let s =  dob.split('-')
      dobformat = s[2] + '/' + s[1] + '/' + s[0];
      dob = dobformat
    }
      const id = storageUtils.get('profile').id;
      this.registerSv.saveProffile({fullName,dob,gender,phone,bhyt,address,id}).subscribe();
    }
    else {
      console.log('form khong hop le')
    }
  }
}

import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import DataTables from 'datatables.net';
import { data } from 'jquery';
import { Observable, Subject } from 'rxjs';
import { Booking } from 'src/app/models/booking';
import { Hours } from 'src/app/models/hour';
import { Schedule } from 'src/app/models/schedule';
import { BookingService } from 'src/app/services/booking.service';
import { HistoryService } from 'src/app/services/history.service';
import { MedicalServiceService } from 'src/app/services/medical-service.service';
import { MedicineService } from 'src/app/services/medician.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent {
  totalMoney: number = 0;
  lschedule : any;
  lbooking : any;
  // ds thuoc 
  lmedicine:any = [];
  // ds dich vu
  lservice:any = [];
  lmedicineAPI: any = [];
  lserviceAPI: any = [];
  itemClick : any = null;
  string1 = ''
  addForm!:FormGroup;
  historyForm!:FormGroup;
  dtTrigger:Subject<any>=new Subject<any>();
  dtOption: DataTables.Settings =  {}
  @ViewChild(DataTableDirective, {static: false})
  dtElement!: DataTableDirective;
  hours = Hours;
  constructor(private scheSv: ScheduleService, private bookingsv : BookingService,private medicineSv: MedicineService,private medicalSv: MedicalServiceService,
    private formbuilder : FormBuilder, private changref: ChangeDetectorRef, private historySv: HistoryService){};

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers',
      renderer: 'true',
      retrieve:true,
      info:false
    }
    this.addForm = this.formbuilder.group({
      start : ['',Validators.required],
      end : ['',Validators.required]
    })

    this.historyForm = this.formbuilder.group({
      fullName: '',
      dob : new Date().toISOString().split('T')[0],
      address : '',
      bhyt: '',
      nation: '',
      gender : true,
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      medicalSummary: '',
      realQuantity: 1
    })

    this.bookingsv.getAllBooking('ACCEPTING',storageUtils.get('userId') || null,null,null,null).subscribe(res => {
      this.lbooking = res;
      this.changref.detectChanges()
      this.dtTrigger.next(null)
    })

    this.medicineSv.getAllMedicine().subscribe((res) => {
      this.lmedicineAPI = res;
      this.lmedicineAPI.map((item: any) => {
        item.realQuantity = 1;
        return item;
      })
      this.lmedicineAPI = [{
        "id": 0,
        "name": "--Todo--",
        "quantity": 0,
        "money": 0,
        "unit": "",
        "description": "",
        "realQuantity": 0
    },...this.lmedicineAPI];
    });

    this.medicalSv.getAllMedicalService().subscribe((res) => {
      this.lserviceAPI = res;
      this.lserviceAPI = [{
        "id": 0,
        "name": "--Todo--",
        "money": 0,
        "description": ""
    },...this.lserviceAPI];
    });

  }

  onSearch() {
    const {start,end} = this.addForm.value;
    let startformat = ''
    let endformat = ''
    if(start != '') {
      let s =  start.split('-')
      startformat = s[2] + '/' + s[1] + '/' + s[0];
    }
    if(end != '') {
      let s =  end.split('-')
      endformat = s[2] + '/' + s[1] + '/' + s[0];
    }
    console.log(startformat + "---" + endformat)
    this.bookingsv.getAllBooking('ACCEPTING',storageUtils.get('userId') || null,startformat,endformat,null).subscribe(res =>{
      this.lbooking = res;
      if (this.dtElement.dtInstance) {
        // Sử dụng ajax.reload() để cập nhật dữ liệu
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next(null);
        });
      } else {
        // Nếu DataTable chưa được khởi tạo, khởi tạo nó
        this.dtTrigger.next(null);
      }
    })
  }

  loaddata() {
    this.bookingsv.getAllBooking('ACCEPTING',storageUtils.get('userId') || null,null,null,null).subscribe(res => {
      this.lbooking = res;
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        if (this.dtElement.dtInstance) {
          // Sử dụng ajax.reload() để cập nhật dữ liệu
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(null);
          });
        } else {
          // Nếu DataTable chưa được khởi tạo, khởi tạo nó
          this.dtTrigger.next(null);
        }
      });
    })
  }

  onReset() {
    this.loaddata()
    this.addForm.patchValue({
      start : '',
      end : ''
    })
  }

  onSearchToday() {
    this.addForm.patchValue({
      start : '',
      end : ''
    })
    let date = new Date();
    let st = formatDate(date, 'dd/MM/yyyy', 'en-US')
    this.bookingsv.getAllBooking('ACCEPTING',storageUtils.get('userId') || null,st,st,null).subscribe(res =>{
      this.lbooking = res;
      if (this.dtElement.dtInstance) {
        // Sử dụng ajax.reload() để cập nhật dữ liệu
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next(null);
        });
      } else {
        // Nếu DataTable chưa được khởi tạo, khởi tạo nó
        this.dtTrigger.next(null);
      }
    })
  }
  ngOnDestroy() {
      this.dtTrigger.unsubscribe()
  }

  xacnhan(id: number, status: string) {
    this.bookingsv.updateBooking(id,status).subscribe({
      next : (value) => {
          this.lbooking = value;
          this.xacnhankham();
      },
      error(err) {
          alert('Đã xảy ra lỗi: ' + err)
      },
    })
  }

  changeObject(item: any) {
      this.itemClick = item;
  }

  changeMedicine(item: any, event: number) {   
    if(event == 1) {
      if(item.target.value == 0) {
        return;
      }
      for(let i = 0; i < this.lmedicineAPI.length; i++) {
        if(this.lmedicineAPI[i].id == item.target.value && this.checkAvailableMedicine(this.lmedicineAPI[i]) == false) {
          this.lmedicine.push({...this.lmedicineAPI[i], realQuantity: 1});
          break;
        }
      }
    } else {
      this.lmedicine = this.lmedicine.filter((x: any) => x.id != item.id)
    }
    this.calculateTotalMoney();
  }

  checkAvailableMedicine(item: any) {
    for(let i = 0; i < this.lmedicine.length; i++) {
      if(this.lmedicine[i].id == item.id) {
        return true;
      }
    }
    return false;
  }

  changeService(item: any, event: number) {
    if(event == 1) {
      if(item.target.value == 0) {
        return;
      }
      for(let i = 0; i < this.lserviceAPI.length; i++) {
        if(this.lserviceAPI[i].id == item.target.value && this.checkAvailableService(this.lserviceAPI[i]) == false) {
          this.lservice.push({...this.lserviceAPI[i]});
          break;
        }
      }
    } else {
      this.lservice = this.lservice.filter((x: any) => x.id != item.id)
    }
    this.calculateTotalMoney();
  }

  checkAvailableService(item: any) {
    for(let i = 0; i < this.lservice.length; i++) {
      if(this.lservice[i].id == item.id) {
        return true;
      }
    }
    return false;
  }

  calculateTotalMoney() {
    this.totalMoney = 0;
    for(let i = 0; i < this.lmedicine.length; i++) {
      this.totalMoney += this.lmedicine[i].realQuantity * this.lmedicine[i].money;
    }
    for(let i = 0; i < this.lservice.length; i++) {
      this.totalMoney += this.lservice[i].money;
    }
    return this.totalMoney;
  }

  xacnhankham() {
    if(this.historyForm.valid) {
      const {fullName,dob,address,bhyt,nation,gender,fromDate,toDate,medicalSummary} = this.historyForm.value;
      let medicineStr = "", serviceStr = "";
      this.lmedicine.forEach((item: any) => {
        medicineStr += (item.id + ':' + item.realQuantity + ',')
      });
      this.lservice.forEach((item: any) => {
        serviceStr += (item.id + ',')
      });
      const bookingId = this.itemClick.id;
      this.historySv.saveHistory({fullName,dob,address,bhyt,nation,gender,fromDate,toDate,medicalSummary,medicineStr,serviceStr,bookingId,'totalMoney': this.totalMoney})
      .subscribe({
        next: (value) => {
          this.loaddata();
          alert('Xác nhận thành công!');
        },
        error(err) {
          console.log(err)
          alert('Đã có lỗi xảy ra: ' + err.error.message);
        },
      });
    }else {
      console.log('form khong hop le',this.historyForm.value);
    }
  }



}

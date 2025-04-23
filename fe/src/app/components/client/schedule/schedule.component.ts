import { DatePipe, formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { Observable, map, of } from 'rxjs';
import { Doctor } from 'src/app/models/doctor';
import { Hour } from 'src/app/models/hour';
import { Major } from 'src/app/models/major';
import { Schedule, Schedules, schedules } from 'src/app/models/schedule';
import { BookingService } from 'src/app/services/booking.service';
import { DoctorService } from 'src/app/services/doctor.service';
import { HourService } from 'src/app/services/hour.service';
import { MajorService } from 'src/app/services/major.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent {
  @Input() ok = false;
  @Input() ktra : boolean = false;
  //ngayban : Ngày mà bác sĩ có lịch trùng
  ngayban : Schedules[] = []
  disableDate : Date[] = [];
  selectedTime: string | null = null; 
  submited=false;
  listMajor!:Observable<Major[]>;
  listDoctor!:Observable<Doctor[]>;
  listHour!:Observable<Hour[]>;
  listHourTrung : number[] = [];
  profileInfor = storageUtils.get('profile');
  minDate: Date = new Date();

  addForm!: FormGroup;

  constructor(private formbuilder : FormBuilder,private majorsv: MajorService,
    private doctorsv : DoctorService, private schesv : ScheduleService,private bookingsv : BookingService,
        private hoursv : HourService){};
  
  ngOnInit() {
    this.addForm = this.formbuilder.group({
      name:['',Validators.compose([Validators.minLength(6),Validators.required])],
      dob: ['',Validators.required],
      phone: ['',Validators.compose([Validators.minLength(9),Validators.maxLength(12),Validators.required])],
      email: ['',Validators.compose([Validators.email,Validators.required])],
      gender: ['MALE',Validators.required],
      address: ['',Validators.compose([Validators.required,Validators.minLength(10),Validators.maxLength(50)])],
      idMajor: ['',Validators.required],
      idUser: ['',Validators.required],
      date: ['',Validators.required],
      idHour: ['',Validators.required],
      note: ['',Validators.required]
    })

    this.listMajor = this.majorsv.getAllMajors();
    this.listMajor.subscribe({
      next(value) {
          console.log('lay data ok nha')
      },
      error(err) {
          console.log('Đã lỗi khi gọi data')
      },
    })
  }

  get f() {
    return this.addForm.controls;
  }

  onsb() {
    this.submited = true;
    if(this.addForm.valid) {
      const {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note} = this.addForm.value;
      const isoString: string = formatDate(date, 'dd/MM/yyyy', 'en-US');
      const x = confirm('Bạn có đồng ý đăng lý lịch khám với những thông tin vừa nhập không?')
            if(x==true) {
                this.bookingsv.createBooking(name,dob,phone,email,gender,address,idMajor,idUser,isoString,idHour,note).subscribe({
                    next : (value) => {
                      this.submited = false;
                      this.addForm.patchValue({
                        idMajor: '',
                        idUser:  '',
                        date:    '',
                        idHour:  '',
                        note:    ''
                      })
                      this.listDoctor = of([]);
                      this.listHour = of([])
                        alert('Hãy mở email ra để xác nhận lịch đăng ký')
                        // redirect đến 1 trang nào đó với nội dung là đã thêm thành công, đang chờ duyệt , check email để nhận kết quả
                    },
                    error(err) {
                        console.log('Đã có lỗi xảy ra khi thêm: ',err)
                    },
                  })
            }
    }
  }

  onselectkhoa() {
    this.addForm.patchValue({
      idUser : ''
    });
    const id = this.addForm?.get('idMajor')?.value;
    this.listDoctor = this.doctorsv.getAllDoctorByMajor(null,'true',id,'');
    this.listDoctor.subscribe({
      next(value) {
          console.log('da chay selec doctor')
      },
      error(err) {
          console.log('co loi',err)
      },
    });
  }

  onselectDoctor() {
    this.ngayban = []
    this.disableDate = []
    this.listHour = of([])
    const id = this.addForm?.get('idUser')?.value;
    this.schesv.getAllScheduleByIdDoctor(id).subscribe({
      next : (value) => {
          let map = new Map();
          value.forEach( e => {
            map.set(e.date,(map.get(e.date) || 0) + 1)
            if(map.get(e.date) >= 8) this.disableDate.push(new Date(e.date))
            else this.ngayban.push(e)
          })
          console.log('disable : ' + this.disableDate)
      },

      error(err) {
          console.log('Hava error!!!')
      },
    });
  }

  uncheckRadio() {
    this.selectedTime = null; 
  }
  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.listHourTrung = [];
    const {name,dob,phone,email,gender,address,idMajor,idUser,date,session,note} = this.addForm.value;
    const isoString: string = formatDate(date, 'dd/MM/yyyy', 'en-US'); // Gia tri cua ngay duoc chon
    // console.log('gia tri that:',isoString);

    console.log('vip: ' + isoString)
    this.bookingsv.getAllBooking('PENDING',idUser,isoString,isoString,null).subscribe({
      next : (value)=> {        
        console.log('gia tri value : ' + value)
        value.forEach(e => this.listHourTrung.push(e.idHour));
        this.listHour = this.hoursv.getAllHour();
        this.listHour.subscribe();
      },
    })
  }

  myFilter = (d: Date | null): boolean => {
    const selectedDate = d || new Date();
    return !this.disableDate.some((disabledDate) =>
      this.isSameDate(selectedDate, disabledDate)
    );
    return true;
  };

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  autoFill() {
    this.addForm.patchValue({
      name: this.profileInfor.fullName,
      dob:  new Date(this.profileInfor.dob).toISOString().split('T')[0],
      phone:    this.profileInfor.phone,
      email:  this.profileInfor.gmail,
      address:  this.profileInfor.address,
      gender: this.profileInfor.gender
    })
  }
}

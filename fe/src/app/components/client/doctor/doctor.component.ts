import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterLinkActive } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Doctor } from 'src/app/models/doctor';
import { Major } from 'src/app/models/major';
import { DoctorService } from 'src/app/services/doctor.service';
import { MajorService } from 'src/app/services/major.service';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss']
})
export class DoctorComponent {
  // render, search, select major, pagination
  p : any
  listDoctor : any
  listMajor!: Observable<Major[]>
  addForm !: FormGroup;
  khoa = -1;

  constructor(private route : Router, private doctorsv : DoctorService, private majorsv :MajorService,
    private formbuilder : FormBuilder){};

  ngOnInit() {
    this.addForm = this.formbuilder.group({
      key : ['']
    })
    this.listDoctor = this.doctorsv.getAllDoctors('true');
    this.listDoctor.subscribe((value: any) => this.listDoctor = value)

    this.listMajor = this.majorsv.getAllMajors();
    this.listMajor.subscribe({
      next(value) {
        // logic code
        console.log('get data ok' + value)
    },
    error(err) {
        console.log('Error!!!',err)
    },
    })
  }


  onSearch() {
    const {key} = this.addForm.value;
    this.listDoctor = this.doctorsv.getAllDoctorByMajor(null,'true',null,key);
    this.listDoctor.subscribe((value : any) => this.listDoctor = value)
  }

  onSelect() {
    this.p = 1
    if(this.khoa==-1) {
      this.listDoctor = this.doctorsv.getAllDoctors('true');
      this.listDoctor.subscribe((value: any) => this.listDoctor = value)
    }
    else {
      this.listDoctor = this.doctorsv.getAllDoctorByMajor(null,'true',this.khoa,null);
      this.listDoctor.subscribe((value : any) => this.listDoctor = value)
    }
  }

  xem(id : number) {
    this.route.navigate([`public/bac-si-chi-tiet/${id}`])
  }

  // Navigate to booking page with pre-selected doctor
  datLichHen(doctorId: number) {
    // Navigate to home page where the schedule component is located
    // Pass doctor ID as query parameter
    this.route.navigate(['/public/trang-chu'], { 
      queryParams: { 
        doctorId: doctorId,
        mode: 'BY_DOCTOR' // Set booking mode to BY_DOCTOR
      },
      fragment: 'booking-section' // Scroll to booking section
    });
  }

}
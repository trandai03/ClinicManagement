import { Component } from '@angular/core';
import { ActivatedRoute, Route, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { Doctor } from 'src/app/models/doctor';
import { DoctorService } from 'src/app/services/doctor.service';

@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.scss']
})
export class DoctorDetailComponent {
  an : boolean = true;
  doctor$ !: Observable<Doctor>;
  doctor: Doctor= {
    id: 0,
    avatar: '',
    fullName: '',
    userName: '',
    phone: '',
    email: '',
    roleId: 0,
    enabled: false,
    major: {
      id: 0,
      name: '',
      description: '',
      image: ''
    },
    description: '',
    trangthai: ''
  }

  constructor(private doctorsv : DoctorService, private route : ActivatedRoute){};

  ngOnInit() {
    this.route.params.subscribe(params => {
      const activeParam = params['id'];
      console.log(activeParam)
      this.doctor$ = this.doctorsv.getDoctorById(activeParam);
      this.doctor$.subscribe({
        next:(value)=> {
            this.doctor = value;
            console.log('get data thanh cong')
        },
        error(err) {
            console.log('loi loi mat: ',err)
        },
      })
    });
  }
}

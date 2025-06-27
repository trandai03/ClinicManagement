import { Component } from '@angular/core';
import { ActivatedRoute, Route, RouterLinkActive, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Doctor } from 'src/app/models/doctor';
import { DoctorService } from 'src/app/services/doctor.service';

@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.scss']
})
export class DoctorDetailComponent {
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
    doctorRank: {
      id: 0,
      name: '',
      description: '',
      code: '',
      basePrice: 0
    },
    description: '',
    trangthai: ''
  }

  constructor(private doctorsv : DoctorService, private route : ActivatedRoute, private router: Router){};

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

  // Navigate to booking form with pre-selected doctor
  datLichKham() {
    if (this.doctor && this.doctor.id) {
      // Navigate to home page where the schedule component is located
      // Pass doctor ID as query parameter
      this.router.navigate(['/public/trang-chu'], { 
        queryParams: { 
          doctorId: this.doctor.id,
          mode: 'BY_DOCTOR' // Set booking mode to BY_DOCTOR
        },
        fragment: 'booking-section' // Scroll to booking section
      });
    } else {
      console.error('Doctor information not available');
    }
  }
}

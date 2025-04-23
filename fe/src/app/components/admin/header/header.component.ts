import { Component, Renderer2 } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { apiResponse } from 'src/app/models/apiResponse';
import { Doctor } from 'src/app/models/doctor';
import { DoctorService } from 'src/app/services/doctor.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private router : Router, private doctorsv : DoctorService,private renderer : Renderer2){};

  listDoctor !: Observable<Doctor[]>;

  user !: Observable<Doctor>;

  ngOnInit() {

    this.user = this.doctorsv.getDoctorById(storageUtils.get('userId'));
    this.user.subscribe();
  }

  hien(){
    document.body.classList.toggle('toggle-sidebar');
  }
  redirect() {
    storageUtils.clear()
    this.router.navigateByUrl('/login')
  }

  signout() {
    this.doctorsv.logout();
    storageUtils.clear();
  }
}

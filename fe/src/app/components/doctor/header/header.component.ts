import { Component, Renderer2, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from 'src/app/services/doctor.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  idDoctor = 0;
  lDoctor: any;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private doctorsv: DoctorService
  ) {}

  hien() {
    document.body.classList.toggle('toggle-sidebar');
  }

  ngOnInit() {
    this.idDoctor = storageUtils.get('userId') || 0;
    this.doctorsv.getDoctorById(this.idDoctor + '').subscribe((res) => {
      this.lDoctor = res;
    });
  }

  signout() {
    this.doctorsv.logout();
    storageUtils.clear();
    this.router.navigateByUrl('/login');
  }
}

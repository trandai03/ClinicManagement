import { Component, Renderer2, inject, EventEmitter, Output } from '@angular/core';
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
  
  // Event để thông báo cho doctor component khi sidebar toggle
  @Output() sidebarToggled = new EventEmitter<boolean>();

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private doctorsv: DoctorService
  ) {}

  hien() {
    // Toggle sidebar class trên body
    document.body.classList.toggle('toggle-sidebar');
    
    // Thông báo cho parent component (doctor component)
    const isSidebarToggled = document.body.classList.contains('toggle-sidebar');
    this.sidebarToggled.emit(isSidebarToggled);
    
    // Điều chỉnh main content margin
    const mainElement = document.getElementById('main');
    if (mainElement) {
      const isDesktop = window.innerWidth >= 1200;
      if (isDesktop) {
        // Desktop mode
        mainElement.style.marginLeft = isSidebarToggled ? '0' : '300px';
      } else {
        // Mobile mode
        mainElement.style.marginLeft = isSidebarToggled ? '300px' : '0';
      }
    }
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

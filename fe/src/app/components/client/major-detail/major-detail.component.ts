import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Major } from 'src/app/models/major';
import { Doctor } from 'src/app/models/doctor';
import { MajorService } from 'src/app/services/major.service';
import { DoctorService } from 'src/app/services/doctor.service';

@Component({
  selector: 'app-major-detail',
  templateUrl: './major-detail.component.html',
  styleUrls: ['./major-detail.component.scss']
})
export class MajorDetailComponent implements OnInit {
  majorDetail!: Major;
  majorDoctors: Doctor[] = [];
  activeTab: string = 'intro';
  loading: boolean = true;
  majorId!: number;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private majorService: MajorService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        this.majorId = +params['id'];
        this.loading = true;
        return this.majorService.getMajorDetail(this.majorId);
      })
    ).subscribe({
      next: (major) => {
        this.majorDetail = major;
        this.loading = false;
        this.loadDoctors();
      },
      error: (error) => {
        console.error('Error loading major detail:', error);
        this.loading = false;
        // Có thể redirect về trang major list nếu không tìm thấy
        this.router.navigate(['/public/chuyen-khoa']);
      }
    });
  }

  loadDoctors(): void {
    if (this.majorId) {
      this.doctorService.getAllDoctorByMajor(null, 'true', this.majorId, '').subscribe({
        next: (doctors) => {
          this.majorDoctors = doctors;
        },
        error: (error) => {
          console.error('Error loading doctors:', error);
        }
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  datLichKham(doctorId: number): void {
    this.router.navigate(['/public/trang-chu'], {
      queryParams: {
        doctorId: doctorId,
        mode: 'BY_DOCTOR'
      },
      fragment: 'booking-section'
    });
  }

  datLichChuyenKhoa(): void {
    this.router.navigate(['/public/trang-chu'], {
      queryParams: {
        majorId: this.majorId,
        mode: 'BY_DATE'
      },
      fragment: 'booking-section'
    });
  }

  goBack(): void {
    this.router.navigate(['/public/chuyen-khoa']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}

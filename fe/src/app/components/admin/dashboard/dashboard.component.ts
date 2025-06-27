import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ArticleService } from 'src/app/services/article.service';
import { BookingService } from 'src/app/services/booking.service';
import { DoctorService } from 'src/app/services/doctor.service';
import { MajorService } from 'src/app/services/major.service';
import { HourService } from 'src/app/services/hour.service';
import { Hour } from 'src/app/models/hour';
import { TopDoctor } from 'src/app/models/doctor';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  bs = 0;
  baid = 0;
  dv = 0;
  slkhoa = new Map<string,number>();
  bacsitheokhoa = new Map<string,number>();
  labelkhoa: string[] = [];
  benhnhantheokhoa: number[] = [];
  bacsitheokhoa_data: number[] = [];
  slbenhnhan = new Map<string, number>();
  monthlyPatientData: number[] = [];
  hours: Hour[] = [];
  bookingsByHour = new Map<number, number>();
  hourLabels: string[] = [];
  hourBookingData: number[] = [];
  totalBookingsToday = 0;
  topDoctors: TopDoctor[] = [];
  isLoadingTopDoctors = false;
  topDoctorsError: string | null = null;
  patientChart: Chart | null = null;

  constructor(
    private doctor: DoctorService, 
    private major: MajorService,
    private articlesv: ArticleService, 
    private bookingsv: BookingService,
    private hourSv: HourService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    console.log('Dashboard component initialized');
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loadHoursData();
    this.loadTopDoctors();

    forkJoin({
      majors: this.major.getAllMajors(),
      bookings: this.bookingsv.getAllBooking('SUCCESS', null, null, null, null),
      articles: this.articlesv.getAllArticles()
    }).subscribe({
      next: (data) => {
        console.log('All data loaded:', data);
        
        data.majors.forEach(e => this.labelkhoa.push(e.name));
        this.dv = data.majors.length;
        this.baid = data.articles.length;
        
        this.processBookingData(data.bookings);
        this.loadDoctorData();
        this.analyzeBookingHours(data.bookings);
        
        setTimeout(() => {
          this.createPatientChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  processBookingData(bookings: any[]) {
    bookings.forEach(booking => {
      if (booking.date.slice(0, 4) === '2025') {
        const month = booking.date.slice(5, 7);
        const count = this.slbenhnhan.get(month) ?? 0;
        this.slbenhnhan.set(month, count + 1);
        
        const majorCount = this.slkhoa.get(booking.major) ?? 0;
        this.slkhoa.set(booking.major, majorCount + 1);
      }
    });

    this.monthlyPatientData = [
      this.slbenhnhan.get('01') ?? 0, this.slbenhnhan.get('02') ?? 0, this.slbenhnhan.get('03') ?? 0, 
      this.slbenhnhan.get('04') ?? 0, this.slbenhnhan.get('05') ?? 0, this.slbenhnhan.get('06') ?? 0, 
      this.slbenhnhan.get('07') ?? 0, this.slbenhnhan.get('08') ?? 0, this.slbenhnhan.get('09') ?? 0, 
      this.slbenhnhan.get('10') ?? 0, this.slbenhnhan.get('11') ?? 0, this.slbenhnhan.get('12') ?? 0
    ];

    this.labelkhoa.forEach(major => {
      const count = this.slkhoa.get(major) ?? 0;
      this.benhnhantheokhoa.push(count);
    });

    console.log('Monthly patient data:', this.monthlyPatientData);
    this.autoplay3(this.labelkhoa, this.benhnhantheokhoa);
  }

  loadHoursData() {
    this.hourSv.getAllHour().subscribe(res => {
      this.hours = res;
      console.log('Hours loaded:', this.hours);
    });
  }

  analyzeBookingHours(bookings: any[]) {
    this.bookingsByHour.clear();
    this.hourLabels = [];
    this.hourBookingData = [];
    
    bookings.forEach(booking => {
      const hourId = booking.idHour;
      const currentCount = this.bookingsByHour.get(hourId) ?? 0;
      this.bookingsByHour.set(hourId, currentCount + 1);
    });
    
    this.hours.forEach(hour => {
      const count = this.bookingsByHour.get(hour.id) ?? 0;
      this.hourLabels.push(hour.name);
      this.hourBookingData.push(count);
    });
    
    this.totalBookingsToday = this.hourBookingData.reduce((sum, count) => sum + count, 0);
    this.createPeakHoursChart();
  }

  loadDoctorData() {
    this.doctor.getAllDoctors('true').subscribe(res => {
      this.bs = res.length;
      
      this.bacsitheokhoa.clear();
      this.bacsitheokhoa_data = [];
      
      res.forEach(doctor => {
        const majorName = doctor.major.name;
        const currentCount = this.bacsitheokhoa.get(majorName) ?? 0;
        this.bacsitheokhoa.set(majorName, currentCount + 1);
      });
      
      this.labelkhoa.forEach(khoaName => {
        const count = this.bacsitheokhoa.get(khoaName) ?? 0;
        this.bacsitheokhoa_data.push(count);
      });
      
      this.autoplay2();
    });
  }

  loadTopDoctors() {
    this.isLoadingTopDoctors = true;
    this.topDoctorsError = null;

    // Get current month for filtering
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    // Get all bookings and doctors data
    forkJoin({
      bookings: this.bookingsv.getAllBooking('SUCCESS', null, null, null, null),
      doctors: this.doctor.getAllDoctors('true')
    }).subscribe({
      next: (data) => {
        try {
          // Filter bookings for current month
          const currentMonthBookings = data.bookings.filter(booking => {
            const bookingDate = booking.date;
            const bookingYear = bookingDate.slice(0, 4);
            const bookingMonth = bookingDate.slice(5, 7);
            return bookingYear === currentYear && bookingMonth === currentMonth;
          });

          // Count bookings per doctor name
          const doctorBookingCount = new Map<string, number>();
          currentMonthBookings.forEach(booking => {
            const doctorName = booking.nameDoctor;
            const count = doctorBookingCount.get(doctorName) || 0;
            doctorBookingCount.set(doctorName, count + 1);
          });

          // Create top doctors list
          const topDoctorsList: TopDoctor[] = [];
          doctorBookingCount.forEach((bookingCount, doctorName) => {
            const doctor = data.doctors.find(d => d.fullName === doctorName);
            if (doctor) {
              topDoctorsList.push({
                rank: 0, // Will be set after sorting
                doctor: doctor,
                bookingCount: bookingCount
              });
            }
          });

          // Sort by booking count (descending) and take top 10
          topDoctorsList.sort((a, b) => b.bookingCount - a.bookingCount);
          this.topDoctors = topDoctorsList.slice(0, 10).map((item, index) => ({
            ...item,
            rank: index + 1
          }));

          console.log('Top doctors loaded successfully:', this.topDoctors);
          this.isLoadingTopDoctors = false;
        } catch (error) {
          console.error('Error processing top doctors data:', error);
          this.topDoctorsError = 'Lỗi xử lý dữ liệu thống kê';
          this.isLoadingTopDoctors = false;
        }
      },
      error: (error) => {
        console.error('Error loading top doctors data:', error);
        this.topDoctorsError = 'Không thể tải dữ liệu thống kê';
        this.isLoadingTopDoctors = false;
      }
    });
  }

  createPatientChart() {
    if (this.patientChart) {
      this.patientChart.destroy();
      this.patientChart = null;
    }

    const canvas = document.getElementById('patientChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Patient chart canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Cannot get canvas context');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.3)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.05)');

    this.patientChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
        datasets: [{
          label: 'Số bệnh nhân khám',
          data: this.monthlyPatientData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              label: function(context) {
                return `Số bệnh nhân: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Tháng'
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số lượng bệnh nhân'
            }
          }
        }
      }
    });

    console.log('Patient chart created successfully');
  }

  autoplay2() {
    const canvas = document.getElementById('myChart2') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.labelkhoa,
        datasets: [{
          data: this.bacsitheokhoa_data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  autoplay3(labelkhoa: any, dsbenhnhan: any) {
    const canvas = document.getElementById('myChart3') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labelkhoa,
        datasets: [{
          label: 'Số bệnh nhân',
          data: dsbenhnhan,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createPeakHoursChart() {
    const canvas = document.getElementById('myChart4') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.hourLabels,
        datasets: [{
          label: 'Số lượt đặt lịch',
          data: this.hourBookingData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Khung giờ cao điểm đặt lịch'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  getPeakHour(): string {
    if (this.hourBookingData.length === 0) return 'Chưa có dữ liệu';
    
    const maxCount = Math.max(...this.hourBookingData);
    const maxIndex = this.hourBookingData.indexOf(maxCount);
    
    return this.hourLabels[maxIndex] || 'Chưa xác định';
  }

  getPeakHourCount(): number {
    return this.hourBookingData.length > 0 ? Math.max(...this.hourBookingData) : 0;
  }

  getDoctorCountByMajor(majorName: string): number {
    return this.bacsitheokhoa.get(majorName) || 0;
  }

  refreshDashboard() {
    // Reset all data
    this.bs = 0;
    this.baid = 0;
    this.dv = 0;
    this.slkhoa.clear();
    this.bacsitheokhoa.clear();
    this.labelkhoa = [];
    this.benhnhantheokhoa = [];
    this.bacsitheokhoa_data = [];
    this.slbenhnhan.clear();
    this.monthlyPatientData = [];
    this.bookingsByHour.clear();
    this.hourLabels = [];
    this.hourBookingData = [];
    this.totalBookingsToday = 0;
    
    // Reload dashboard data
    this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.patientChart) {
      this.patientChart.destroy();
      this.patientChart = null;
    }
  }
} 
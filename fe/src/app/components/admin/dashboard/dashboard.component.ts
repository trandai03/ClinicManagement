import { Component } from '@angular/core';
import { Chart } from 'chart.js';
import { delay } from 'rxjs';
import { Product } from 'src/app/models/product';
import { ArticleService } from 'src/app/services/article.service';
import { BookingService } from 'src/app/services/booking.service';
import { DoctorService } from 'src/app/services/doctor.service';
import { MajorService } from 'src/app/services/major.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  basicData: any;
  basicOptions: any;
  bs = 0;baid = 0;dv = 0;
  slkhoa = new Map<string,number>();
  labelkhoa : string[] = []
  benhnhantheokhoa: number[] = []
  slbenhnhan = new Map<string, number>();

  constructor(private doctor: DoctorService, private major : MajorService,
               private articlesv : ArticleService, private bookingsv : BookingService){}

  ngOnInit() {

    this.major.getAllMajors().subscribe(res => {
      res.forEach(e => this.labelkhoa.push(e.name))
    })

    this.bookingsv.getAllBooking('SUCCESS',null,null,null,null).subscribe(res => {
      console.log('so luong ngay')
      console.log(this.slbenhnhan.get('03'))
      res.forEach(e => {
        if(e.date.slice(6,10)=='2025') {
          const count = this.slbenhnhan.get(e.date.slice(0,2)) ?? 0;
          this.slbenhnhan.set(e.date.slice(0,2), count + 1);
          const count1 = this.slkhoa.get(e.major) ?? 0;
          console.log(e.major, this.slbenhnhan.get(e.major))
          this.slkhoa.set(e.major,(count1 + 1))
        }
      })

      this.labelkhoa.forEach(e => {
        const sl = this.slkhoa.get(e) ?? 0
        this.benhnhantheokhoa.push(sl)
      })
      this.autoplay3(this.labelkhoa,this.benhnhantheokhoa);
      const dataparam = [this.slbenhnhan.get('01') ?? 0, this.slbenhnhan.get('02') ?? 0, this.slbenhnhan.get('03') ?? 0, 
      this.slbenhnhan.get('04') || 0, this.slbenhnhan.get('05') ?? 0, this.slbenhnhan.get('06') ?? 0, this.slbenhnhan.get('07') ?? 0,
      this.slbenhnhan.get('08') ?? 0, this.slbenhnhan.get('09') ?? 0, this.slbenhnhan.get('10') ?? 0, this.slbenhnhan.get('11') ?? 0,
      this.slbenhnhan.get('12') ?? 0]; 
      this.autoplay(dataparam);
      
    })

    this.doctor.getAllDoctors('true').subscribe(res => {
      this.bs = res.length
    })
    this.major.getAllMajors().subscribe(res => {this.dv = res.length})
    this.articlesv.getAllArticles().subscribe(res => {this.baid = res.length})

    
    console.log(this.slbenhnhan)
    console.log(this.slbenhnhan.get('04'))
    
    this.autoplay2()
  }
  autoplay(dataparam : any) {
    console.log('da chay vao chart')
    new Chart('myChart', {
      type: 'bar',
      data: {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
        datasets: [{
          label: 'Thống kê số bệnh nhân đã đến khám trong năm 2025',
          data: dataparam,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  autoplay2() {
    new Chart('myChart2', {
      type: 'pie',
      data: {
        labels: [
          'Khoa mắt',
          'Khoa sinh sản',
          'Khoan thần kinh'
        ],
        datasets: [{
          label: 'My First Dataset',
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
        }]
      }
    })
  }
  autoplay3(labelkhoa: any, dsbenhnhan : any) {
    new Chart('myChart3', {
      type: 'line',
      data: {
        labels: labelkhoa,
        datasets: [{
          label: '',
          data: dsbenhnhan,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      }
    })
  }

}

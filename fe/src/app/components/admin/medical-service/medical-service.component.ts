import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { MedicineService, medicineServices } from 'src/app/models/medicineService';
import { MedicalServiceService } from 'src/app/services/medical-service.service';

@Component({
  selector: 'app-medical-service',
  templateUrl: './medical-service.component.html',
  styleUrls: ['./medical-service.component.css']
})
export class MedicalServiceComponent {
  lmedicalService: any;
  dtOption: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  itemout: MedicineService = {
    id: 0,
    name: '',
    money: 0,
    description: ''
  };
  constructor(private medicalSv: MedicalServiceService) {}

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers',
    };
    this.medicalSv.getAllMedicalService().subscribe((res) => {
      this.lmedicalService = res;
      this.dtTrigger.next(null);
    });
  }

  xem(item: MedicineService) {
    this.itemout = item;
  }

  loaddata(): void {
    this.medicalSv.getAllMedicalService().subscribe((res) => {
      this.lmedicalService = res;
    });
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
  }

  xoa(id: number) {
    this.medicalSv.deleteMedicalService(id).subscribe({
      next: (value) => {
        this.loaddata();
        alert('Đã xóa thành công');
      },
      error(err) {
        alert('Đã xảy ra lỗi');
      },
    });
  }
}

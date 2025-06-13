import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
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

  // New medical service object for form binding
  newMedicalService: MedicineService = {
    id: 0,
    name: '',
    money: 0,
    description: ''
  };

  constructor(
    private medicalSv: MedicalServiceService,
    private toastr: ToastrService
  ) {}

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
        this.toastr.success('Đã xóa thành công', 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Đã xảy ra lỗi', 'Lỗi');
      },
    });
  }

  // Add new medical service method
  addMedicalService() {
    this.medicalSv.createMedicalService(
      this.newMedicalService.name,
      this.newMedicalService.money,
      this.newMedicalService.description
    ).subscribe({
      next: (response) => {
        // Reset form after successful submission
        this.newMedicalService = {
          id: 0,
          name: '',
          money: 0,
          description: ''
        };

        // Reload data to show the new service
        this.loaddata();
        this.toastr.success('Thêm dịch vụ mới thành công', 'Thành công');
      },
      error: (err) => {
        console.error('Error adding medical service:', err);
        this.toastr.error('Đã xảy ra lỗi khi thêm dịch vụ mới', 'Lỗi');
      }
    });
  }

  // Update medical service method
  updateMedicalService() {
    this.medicalSv.updateMedicalService(
      this.itemout.id,
      this.itemout.name,
      this.itemout.money,
      this.itemout.description
    ).subscribe({
      next: (response) => {
        // Reload data to show the updated service
        this.loaddata();
        this.toastr.success('Cập nhật dịch vụ thành công', 'Thành công');
      },
      error: (err) => {
        console.error('Error updating medical service:', err);
        this.toastr.error('Đã xảy ra lỗi khi cập nhật dịch vụ', 'Lỗi');
      }
    });
  }
}

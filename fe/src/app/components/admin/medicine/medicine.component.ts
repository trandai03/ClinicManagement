import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Medicine } from 'src/app/models/medicine';
import { MedicineService } from 'src/app/services/medician.service';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.css'],
})
export class MedicineComponent {
  lmedicine: any;
  dtOption: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  itemout: Medicine = {
    id: 0,
    name: '',
    quantity: 0,
    money: 0,
    description: '',
    unit: '',
  };

  // New medicine object for form binding
  newMedicine: Medicine = {
    id: 0,
    name: '',
    quantity: 0,
    money: 0,
    description: '',
    unit: 'VI',
  };

  constructor(
    private medicineSv: MedicineService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers',
    };
    this.medicineSv.getAllMedicine().subscribe((res) => {
      console.log('gia tri nay: ', res);
      this.lmedicine = res;
      this.dtTrigger.next(null);
    });
  }

  xem(item: Medicine) {
    this.itemout = item;
  }

  loaddata(): void {
    this.medicineSv.getAllMedicine().subscribe((res) => {
      this.lmedicine = res;
    });
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
  }

  xoa(id: number) {
    this.medicineSv.deleteMedicine(id).subscribe({
      next: (value) => {
        this.loaddata();
        this.toastr.success('Đã xóa thành công', 'Thành công');
      },
      error: (err) => {
        this.toastr.error('Đã xảy ra lỗi', 'Lỗi');
      },
    });
  }

  addMedicine() {
    this.medicineSv.createMedicine(
      this.newMedicine.name,
      this.newMedicine.quantity,
      this.newMedicine.money,
      this.newMedicine.description,
      this.newMedicine.unit
    ).subscribe({
      next: (response) => {
        // Reset form after successful submission
        this.newMedicine = {
          id: 0,
          name: '',
          quantity: 0,
          money: 0,
          description: '',
          unit: 'VI',
        };

        // Reload data to show the new medicine
        this.loaddata();
        this.toastr.success('Thêm thuốc mới thành công', 'Thành công');
      },
      error: (err) => {
        console.error('Error adding medicine:', err);
        this.toastr.error('Đã xảy ra lỗi khi thêm thuốc mới', 'Lỗi');
      }
    });
  }

  updateMedicine() {
    this.medicineSv.updateMedicine(
      this.itemout.id,
      this.itemout.name,
      this.itemout.quantity,
      this.itemout.money,
      this.itemout.description,
      this.itemout.unit
    ).subscribe({
      next: (response) => {
        // Reload data to show the updated medicine
        this.loaddata();
        this.toastr.success('Cập nhật thuốc thành công', 'Thành công');
      },
      error: (err) => {
        console.error('Error updating medicine:', err);
        this.toastr.error('Đã xảy ra lỗi khi cập nhật thuốc', 'Lỗi');
      }
    });
  }
}

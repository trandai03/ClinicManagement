import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
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
  constructor(private medicineSv: MedicineService) {}

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
        alert('Đã xóa thành công');
      },
      error(err) {
        alert('Đã xảy ra lỗi');
      },
    });
  }
}

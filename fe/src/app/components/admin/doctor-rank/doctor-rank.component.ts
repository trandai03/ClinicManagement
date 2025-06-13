import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { apiResponse } from 'src/app/models/apiResponse';
import { DoctorRank } from 'src/app/models/doctorRank';
import { DoctorRankService } from 'src/app/services/doctorRank.service';

@Component({
  selector: 'app-doctor-rank',
  templateUrl: './doctor-rank.component.html',
  styleUrls: ['./doctor-rank.component.scss']
})
export class DoctorRankComponent {
  ldoctorRanks: any;
  dtOption: DataTables.Settings = {}
  dtTrigger: Subject<any> = new Subject()
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  addForm!: FormGroup;
  submited = false;

  itemout: DoctorRank = {
    id: 0,
    name: '',
    description: '',
    code: '',
    basePrice: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(
    private doctorRankSv: DoctorRankService, 
    private formbuilder: FormBuilder, 
    private changRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) { };

  ngOnInit() {
    this.dtOption = {
      pagingType: 'full_numbers'
    }
    this.doctorRankSv.getAllDoctorRanks().subscribe(res => {
      this.ldoctorRanks = res;
      this.dtTrigger.next(null)
    })
    this.addForm = this.formbuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      description: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      code: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      basePrice: ['', Validators.compose([Validators.required, Validators.min(0)])]
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  get f() {
    return this.addForm.controls;
  }

  loaddata(): void {
    this.doctorRankSv.getAllDoctorRanks().subscribe(res => {
      this.ldoctorRanks = res;
    });
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
  }

  onsave() {
    this.submited = true;
    if (!this.addForm.invalid) {
      const { name, description, code, basePrice } = this.addForm.value;
      
      const doctorRankData: DoctorRank = {
        id: 0,
        name: name,
        description: description,
        code: code,
        basePrice: Number(basePrice),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.doctorRankSv.createDoctorRankJSON(doctorRankData).subscribe({
        next: (value: any) => {
          this.loaddata()
          this.toastr.success('Đã tạo thành công!!!');
          this.addForm.reset();
          this.submited = false;
        },
        error: (value: any) => {
          this.toastr.error('Có lỗi rồi!!!');
        }
      })
    }
  }

  onupdate() {
    this.submited = true;
    if (!this.addForm.controls['name'].errors && 
        !this.addForm.controls['description'].errors && 
        !this.addForm.controls['code'].errors && 
        !this.addForm.controls['basePrice'].errors) {
      
      const { name, description, code, basePrice } = this.addForm.value;
      
      const doctorRankData: DoctorRank = {
        id: this.itemout.id,
        name: name,
        description: description,
        code: code,
        basePrice: Number(basePrice),
        createdAt: this.itemout.createdAt,
        updatedAt: new Date()
      };
      
      this.doctorRankSv.updateDoctorRankJSON(doctorRankData, this.itemout.id).subscribe({
        next: (value: any) => {
          this.loaddata();
          this.toastr.success('Đã cập nhật thành công!!!');
          this.addForm.reset();
          this.submited = false;
        },
        error: (value: any) => {
          this.toastr.error('Có lỗi rồi!!!');
        }
      })
    }
  }

  xem(item: DoctorRank) {
    this.itemout = item;
    this.addForm.patchValue({
      name: item.name,
      description: item.description,
      code: item.code,
      basePrice: item.basePrice
    });
  }

  xoa(id: number) {
    this.doctorRankSv.delete(id).subscribe({
      next: (value) => {
        this.loaddata()
        this.toastr.success('Đã xóa thành công!');
      },
      error: (err) => {
        this.toastr.error(err.message, 'Lỗi');
      }
    })
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}

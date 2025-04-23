import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject, filter, map, of, switchMap } from 'rxjs';
import { Doctor } from 'src/app/models/doctor';
import { Major } from 'src/app/models/major';
import { DoctorService } from 'src/app/services/doctor.service';
import { MajorService } from 'src/app/services/major.service';

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss'],
})
export class DoctorsComponent {
  listDoctor: any;
  listMajor!: Observable<Major[]>;
  addForm!: FormGroup;
  submited = false;
  title = '';
  status = '';
  dtOption: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  urlPreview = '';
  fileanh1: File | null = null;

  itemout: Doctor = {
    id: 0,
    avatar: '',
    fullName: '',
    userName: '',
    phone: '',
    email: '',
    roleId: 0,
    enabled: false,
    major: {
      id: 0,
      name: '',
      description: '',
      image: '',
    },
    description: '',
    trangthai: '',
  };
  constructor(
    private route: ActivatedRoute,
    private doctorsv: DoctorService,
    private formbuilder: FormBuilder,
    private majorsv: MajorService,
    private changref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.addForm = this.formbuilder.group({
      fullName: [
        '',
        Validators.compose([Validators.required, Validators.minLength(10)]),
      ],
      userName: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
      phone: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(12),
        ]),
      ],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      description: [
        '',
        Validators.compose([Validators.required, Validators.minLength(10)]),
      ],
      majorId: ['', Validators.required],
      file: ['', Validators.required],
      trangthai: [''],
    });

    this.dtOption = {
      pagingType: 'full_numbers',
      renderer: 'true',
      retrieve: true,
    };

    this.route.params.subscribe((params) => {
      const activeParam = params['vip'];
      this.status = activeParam;
      this.title =
        activeParam === 'true'
          ? 'Danh sách bác sĩ đang làm'
          : 'Danh sách bác sĩ đã rời';
      this.doctorsv.getAllDoctors(this.status).subscribe((res) => {
        this.listDoctor = res;
        if (this.dtElement.dtInstance) {
          // Sử dụng ajax.reload() để cập nhật dữ liệu
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(null);
          });
        } else {
          // Nếu DataTable chưa được khởi tạo, khởi tạo nó
          this.dtTrigger.next(null);
        }
      });
    });
    this.listMajor = this.majorsv.getAllMajors();
    this.listMajor.subscribe();
  }

  get f() {
    return this.addForm.controls;
  }

  loaddata(): void {
    this.doctorsv.getAllDoctors(this.status).subscribe((res) => {
      // Cập nhật dữ liệu của DataTable
      this.listDoctor = res;
      // Kiểm tra nếu DataTable đã được khởi tạo trước đó
      if (this.dtElement.dtInstance) {
        // Sử dụng ajax.reload() để cập nhật dữ liệu
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next(null);
        });
      } else {
        // Nếu DataTable chưa được khởi tạo, khởi tạo nó
        this.dtTrigger.next(null);
      }
    });
  }

  onsave() {
    this.submited = true;
    if (this.addForm.valid) {
      const {
        fullName,
        userName,
        password,
        phone,
        email,
        description,
        majorId,
      } = this.addForm.value;
      const formda = new FormData();
      if (this.fileanh1 !== null) {
        formda.append('file', this.fileanh1);
      }
      const encoder = new TextEncoder();
      const utf8Array = encoder.encode(
        JSON.stringify({
          fullName,
          userName,
          password,
          phone,
          email,
          description,
          majorId,
        })
      );
      const binaryString = String.fromCharCode(...utf8Array);
      const base64Encoded = btoa(binaryString);
      formda.append('doctorDto', base64Encoded);
      this.doctorsv.createDoctor(formda).subscribe({
        next: (value) => {
          this.loaddata();
          alert('Đã tạo thành công!!!');
        },
        error(value) {
          alert('Có lỗi rồi!!!');
        },
      });
    } else {
      console.log('co loi');
    }
  }

  onupdate() {
    this.submited = true;
    const {
      fullName,
      userName,
      password,
      phone,
      email,
      description,
      majorId,
      trangthai,
    } = this.addForm.value;
    if (
      !this.addForm.controls['fullName'].errors &&
      !this.addForm.controls['userName'].errors &&
      !this.addForm.controls['phone'].errors &&
      !this.addForm.controls['email'].errors &&
      !this.addForm.controls['description'].errors
    ) {
      console.log('ok');
      const formda = new FormData();
      if (this.fileanh1 !== null) {
        formda.append('file', this.fileanh1);
      }
      const encoder = new TextEncoder();
      const utf8Array = encoder.encode(
        JSON.stringify({
          fullName,
          userName,
          password,
          phone,
          email,
          description,
          majorId,
          trangthai,
        })
      );
      const binaryString = String.fromCharCode(...utf8Array);
      const base64Encoded = btoa(binaryString);
      formda.append('doctorDto', base64Encoded);
      this.doctorsv.updateDoctor(formda, this.itemout.id).subscribe({
        next: (value) => {
          this.loaddata();
          alert('Đã cập nhật thành công thành công!!!');
        },
        error(err) {
          console.log(err);
          alert('Có lỗi rồi!!!' + err.message);
        },
      });
    }
  }

  sb(event: any) {
    const file: File = event.target.files[0];
    this.fileanh1 = file;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.urlPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  xem(item: Doctor) {
    this.itemout = item;
    this.fileanh1 = null;
    this.addForm.patchValue({
      fullName: this.itemout.fullName,
      userName: this.itemout.userName,
      email: this.itemout.email,
      phone: this.itemout.phone,
      majorId: this.itemout.major.id,
      description: this.itemout.description,
      trangthai: this.itemout.trangthai,
    });
  }
  resetpass(id: number) {
    this.doctorsv.resetPassword(id, this.itemout.email).subscribe({
      next: (value) => {
        alert('Đã reset password thành công!!!');
      },
      error(err) {
        alert('Đã có lỗi xảy ra');
      },
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  restore(id: number) {
    this.doctorsv.restoreStatus(id).subscribe({
      next: (value) => {
        this.loaddata();
        alert('Khôi phục thành công');
      },
      error(err) {
        console.log('co loi' + err);
        alert('có lỗi rồi');
      },
    });
  }
}

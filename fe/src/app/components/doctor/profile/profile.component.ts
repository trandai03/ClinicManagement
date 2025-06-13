import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DoctorService } from 'src/app/services/doctor.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  addForm!: FormGroup;
  submit = false;
  check = true;

  constructor(
    private doctorsv: DoctorService,
    private formbuilder: FormBuilder,
    private toastr: ToastrService
  ) {}
  
  idDoctor = 0;
  lDoctor: any;
  
  ngOnInit() {
    this.addForm = this.formbuilder.group({
      oldpass: ['', Validators.required],
      newpass: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
      renewpass: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });
    this.idDoctor = storageUtils.get('userId') || 0;
    this.doctorsv.getDoctorById(this.idDoctor + '').subscribe((res) => {
      this.lDoctor = res;
    });
  }

  get f() {
    return this.addForm.controls;
  }

  onSave() {
    this.submit = true;
    const { oldpass, newpass, renewpass } = this.addForm.value;
    this.check = newpass == renewpass;
    if (this.addForm.valid && this.check) {
      this.doctorsv
        .changPass(this.idDoctor, oldpass, newpass)
        .subscribe({
          next: (value) => {
            this.toastr.success('Đã cập nhật mật khẩu thành công');
          },
          error: (err) => {
            console.log(err);
            this.toastr.error('Đã có lỗi xảy ra: ' + err.error.message);
          },
        });
    }
  }
}

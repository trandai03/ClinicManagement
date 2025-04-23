import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from 'src/app/services/doctor.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  // See information and change password

  addForm!: FormGroup;
  submit = false;
  check = true;

  constructor(
    private doctorsv: DoctorService,
    private formbuilder: FormBuilder
  ) {}

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
        .changPass(storageUtils.get('userId') || 0, oldpass, newpass)
        .subscribe({
          next(value) {
            alert('Đã cập nhật mật khẩu thành công');
          },
          error(err) {
            console.log(err)
            alert('Đã có lỗi xảy ra: ' + err.error.message);
          },
        });
    }
  }
}

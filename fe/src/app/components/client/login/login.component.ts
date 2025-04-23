import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from 'src/app/services/register.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  pendingSecond = 60;
  check: boolean = true;

  loginForm!: FormGroup;
  captchaForm!: FormGroup;

  constructor(
    private registerSv: RegisterService,
    private toastSv: ToastrService,
    private formbuilder: FormBuilder
  ) {
    this.loginForm = this.formbuilder.group({
      gmail: ['', Validators.compose([Validators.required, Validators.email])],
    });
    this.captchaForm = this.formbuilder.group({
      captcha: ['', Validators.compose([Validators.required, Validators.email])],
    });
  }

  clickSend() {
    const gmail = this.loginForm.get('gmail')?.value;
    console.log(gmail);
    if (this.loginForm.valid) {
      this.registerSv.registerUser(gmail).subscribe(
        (res) => {
          this.toastSv.success(
            'Vui lòng mã gmail ra để nhận mã xác thực',
            'Success'
          );
          this.pendingSecond = 60;
          this.check = false;
          setInterval(() => {
            if (this.pendingSecond > 0) {
              this.pendingSecond--;
              // if (this.pendingSecond == 0) {
              //   this.check = true;
              // }
            }
          }, 1000);
        },
        (error) => {
          this.toastSv.error('Đã xảy ra lỗi', 'Error');
        }
      );
    } else {
      this.toastSv.error('form khong hop le', 'Error');
    }
  }

  validateCaptcha() {
    const captcha = this.captchaForm.get('captcha')?.value;
    const gmail = this.loginForm.get('gmail')?.value;
    this.registerSv.validateCapcha(gmail,captcha).subscribe();
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastSv: ToastrService,
    private formbuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formbuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.toastSv.success('Đăng nhập thành công', 'Success');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastSv.error('Tài khoản hoặc mật khẩu không chính xác', 'Error');
          console.error('Login error:', error);
        }
      });
    } else {
      this.toastSv.error('Vui lòng điền đầy đủ thông tin', 'Error');
      // Đánh dấu tất cả fields là đã touched để hiển thị lỗi
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}

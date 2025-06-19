import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;
  isLoading = false;
  submited = false;

  constructor(
    private authService: AuthService,
    private toastSv: ToastrService,
    private toastService: ToastService,
    private formbuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formbuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onsubmit() {
    this.submited = true;
    if (this.loginForm.valid) {
      this.isLoading = true;
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      const loadingToast = this.toastService.showLoading('Đang đăng nhập...');

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastSv.clear(loadingToast.toastId);
          
          if (response) {
            this.toastService.showSuccess('Đăng nhập thành công! Chào mừng bạn trở lại.', 'Thành công');
            console.log(response);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastSv.clear(loadingToast.toastId);
          
          if (error.status === 401) {
            this.toastService.showError('Tài khoản hoặc mật khẩu không chính xác', 'Đăng nhập thất bại');
          } else {
            this.toastService.showServerError(error);
          }
          console.error('Login error:', error);
        }
      });
    } else {
      this.toastService.showValidationError('Vui lòng điền đầy đủ thông tin đăng nhập');
      
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  login() {
    this.onsubmit();
  }
}

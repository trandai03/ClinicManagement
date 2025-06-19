import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  verificationForm!: FormGroup;
  showVerification = false;
  isLoading = false;
  isVerifying = false;
  contactMethod = '';
  resendCountdown = 0;
  private countdownInterval: any;

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeForms();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private initializeForms() {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      contactMethod: ['', [Validators.required, this.contactMethodValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.verificationForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  // Custom validator cho email hoặc số điện thoại
  private contactMethodValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10,11}$/;

    if (emailPattern.test(value) || phonePattern.test(value)) {
      return null;
    }
    return { invalidContactMethod: true };
  }

  // Custom validator để kiểm tra mật khẩu khớp
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  register() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = this.registerForm.value;
      this.contactMethod = formData.contactMethod;

      // Xác định loại contact method
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contactMethod);
      
      const registerData = {
        fullName: formData.fullName,
        username: formData.username,
        email: isEmail ? formData.contactMethod : null,
        phone: !isEmail ? formData.contactMethod : null,
        password: formData.password
      };

      this.authService.registerUser(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success') {
            this.toastService.success('Mã xác thực đã được gửi!', 'Thành công');
            this.showVerification = true;
            this.startResendCountdown();
          }
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Đã xảy ra lỗi khi đăng ký';
          this.toastService.error(errorMessage, 'Lỗi');
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
      this.toastService.error('Vui lòng điền đầy đủ thông tin hợp lệ', 'Lỗi');
    }
  }

  verifyOTP() {
    if (this.verificationForm.valid) {
      this.isVerifying = true;
      const otp = this.verificationForm.get('otp')?.value;

      this.authService.verifyOTP(this.contactMethod, otp).subscribe({
        next: (response) => {
          this.isVerifying = false;
          if (response.status === 'success') {
            this.toastService.success('Đăng ký thành công!', 'Thành công');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.isVerifying = false;
          const errorMessage = error.error?.message || 'Mã xác thực không chính xác';
          this.toastService.error(errorMessage, 'Lỗi');
        }
      });
    } else {
      this.markFormGroupTouched(this.verificationForm);
    }
  }

  resendOTP() {
    if (this.resendCountdown > 0) return;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contactMethod);
    const resendData = {
      email: isEmail ? this.contactMethod : null,
      phone: !isEmail ? this.contactMethod : null
    };

    this.authService.resendOTP(resendData).subscribe({
      next: (response) => {
        this.toastService.success('Mã xác thực đã được gửi lại!', 'Thành công');
        this.startResendCountdown();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Không thể gửi lại mã xác thực';
        this.toastService.error(errorMessage, 'Lỗi');
      }
    });
  }

  backToRegister() {
    this.showVerification = false;
    this.verificationForm.reset();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.resendCountdown = 0;
    }
  }

  private startResendCountdown() {
    this.resendCountdown = 60;
    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 
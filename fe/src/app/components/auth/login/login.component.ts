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
      password: ['', [Validators.required, Validators.minLength(6)]]
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
            console.log('Login response:', response);
            
            // Debug localStorage after login
            console.log('=== LocalStorage After Login ===');
            console.log('JWT:', localStorage.getItem('jwt'));
            console.log('RoleId:', localStorage.getItem('roleId'));
            console.log('UserId:', localStorage.getItem('userId'));
            console.log('FullName:', localStorage.getItem('fullName'));
            console.log('Profile:', localStorage.getItem('profile'));
            console.log('=== End LocalStorage Debug ===');
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

  // Debug methods
  testLocalStorage() {
    console.log('=== Testing localStorage ===');
    
    // Test basic localStorage
    localStorage.setItem('test-item', 'test-value');
    console.log('Set test-item, got:', localStorage.getItem('test-item'));
    
    // Test JSON storage like our app
    const testData = { name: 'Test User', role: '1' };
    localStorage.setItem('test-json', JSON.stringify(testData));
    console.log('Set test-json, got:', localStorage.getItem('test-json'));
    
    // Check all items
    console.log('All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`  ${key}:`, localStorage.getItem(key));
      }
    }
    
    console.log('=== End localStorage Test ===');
  }

  clearTestStorage() {
    localStorage.removeItem('test-item');
    localStorage.removeItem('test-json');
    console.log('Cleared test items');
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupLocalStorageDebug();
    this.testLocalStoragePersistence();
    
    // Delay một chút để đảm bảo localStorage đã sẵn sàng
    setTimeout(() => {
      this.checkAuthState();
    }, 50);
  }

  private setupLocalStorageDebug() {
    // Override localStorage.clear để track khi nào nó được gọi
    const originalClear = localStorage.clear.bind(localStorage);
    localStorage.clear = () => {
      console.error('🚨 localStorage.clear() called!');
      console.error('🚨 Stack trace:', new Error().stack);
      originalClear();
    };
    
    // Override storageUtils.clear nếu có
    const storageUtils = (window as any).storageUtils;
    if (storageUtils && storageUtils.clear) {
      const originalStorageClear = storageUtils.clear.bind(storageUtils);
      storageUtils.clear = () => {
        console.error('🚨 storageUtils.clear() called!');
        console.error('🚨 Stack trace:', new Error().stack);
        originalStorageClear();
      };
    }
  }

  private testLocalStoragePersistence() {
    console.log('🧪 Testing localStorage persistence...');
    
    // Test 1: Basic localStorage
    localStorage.setItem('app-test', 'working');
    console.log('Basic test:', localStorage.getItem('app-test'));
    
    // Test 2: Check if there's existing auth data
    console.log('Existing auth data:');
    console.log('- jwt:', localStorage.getItem('jwt'));
    console.log('- roleId:', localStorage.getItem('roleId'));
    console.log('- userId:', localStorage.getItem('userId'));
    console.log('- fullName:', localStorage.getItem('fullName'));
    
    // Test 3: Check localStorage length
    console.log('localStorage.length:', localStorage.length);
    
    // Test 4: List all keys
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    console.log('All localStorage keys:', keys);
  }

  private checkAuthState() {
    console.log('🔍 App startup - checking auth state');
    
    // Kiểm tra localStorage
    const token = localStorage.getItem('jwt');
    const roleId = localStorage.getItem('roleId');
    
    if (token && roleId) {
      console.log('✅ Found stored session');
      
      // Debug token expiry
      try {
        const cleanToken = token.replace(/"/g, '');
        const payload = JSON.parse(atob(cleanToken.split('.')[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        
        console.log('🕐 Token exp timestamp:', payload.exp);
        console.log('🕐 Token exp date:', new Date(exp));
        console.log('🕐 Now timestamp:', Math.floor(now / 1000));
        console.log('🕐 Now date:', new Date(now));
        console.log('🕐 Token valid?', now < exp);
        console.log('🕐 Time difference (minutes):', Math.floor((exp - now) / 1000 / 60));
        
        if (now < exp) {
          console.log('✅ Token still valid, restoring session');
          this.authService.restoreUserSession();
        } else {
          console.log('❌ Token expired, clearing session');
          this.authService.clearUserSession();
        }
      } catch (e) {
        console.error('❌ Error parsing token:', e);
        this.authService.clearUserSession();
      }
    } else {
      console.log('❌ No stored session found');
    }
  }
}

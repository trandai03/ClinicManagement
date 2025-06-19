import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  roleUserLogin = storageUtils.get('roleId') || null;
  isMobileMenuOpen = false;
  fullnameUserLogin: string = '';

  ngOnInit() {
    // Load data from storage
    this.loadUserData();

    // Lắng nghe sự kiện storage
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Thêm timeout để load lại data sau khi trang reload (trong trường hợp login)
    setTimeout(() => {
      this.loadUserData();
    }, 100);
  }

  ngOnDestroy() {
    // Hủy lắng nghe sự kiện khi component bị hủy
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  private loadUserData() {
    // Update role
    console.log(storageUtils.get('roleId'))
    this.roleUserLogin = storageUtils.get('roleId') || null;
    
    // Update fullname safely
    const profile = storageUtils.get('profile');
    const fullName = storageUtils.get('fullName');
    
    if (profile && profile.fullName) {
      this.fullnameUserLogin = profile.fullName;
    } else if (fullName) {
      this.fullnameUserLogin = fullName;
    } else {
      this.fullnameUserLogin = '';
      
    }
    
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'userId' || event.key === 'profile' || event.key === 'roleId' || event.key === 'fullName') {
      this.loadUserData();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  signout() {
    console.log('signout')
    storageUtils.remove('userId');
    storageUtils.remove('roleId');
    storageUtils.remove('fullName');
    storageUtils.remove('profile');
    storageUtils.remove('jwt');
    window.location.reload();
  }
  
  // Close mobile menu when window is resized to desktop size
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}

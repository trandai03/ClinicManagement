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
    // Set the fullname safely with null checking
    const profile = storageUtils.get('profile');
    if (profile && profile.fullName) {
      this.fullnameUserLogin = profile.fullName;
    }

    // Lắng nghe sự kiện storage
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngOnDestroy() {
    // Hủy lắng nghe sự kiện khi component bị hủy
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'userId' || event.key === 'profile') {
      // Cập nhật lại giá trị roleUserLogin khi userId thay đổi
      this.roleUserLogin = storageUtils.get('roleId') || null;

      // Update fullname safely when profile changes
      const profile = storageUtils.get('profile');
      if (profile && profile.fullName) {
        this.fullnameUserLogin = profile.fullName;
      }
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  signout() {
    storageUtils.remove('userId');
    storageUtils.remove('roleId');
    storageUtils.remove('fullName');
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

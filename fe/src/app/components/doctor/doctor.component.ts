import { Component, OnInit, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss']
})
export class DoctorComponent implements OnInit, AfterViewInit {
  // Thêm class wrapper cho main content để dịch chuyển theo sidebar
  sidebarVisible = true;
  
  constructor(private renderer: Renderer2) {}
  
  ngOnInit() {
    // Lắng nghe sự kiện toggle sidebar
    document.addEventListener('DOMContentLoaded', () => {
      const toggleButton = document.querySelector('.toggle-sidebar-btn');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          // Thêm delay để đảm bảo CSS đã được áp dụng
          setTimeout(() => {
            this.checkSidebarState();
          }, 50);
        });
      }
      
      // Kiểm tra trạng thái ban đầu
      this.checkSidebarState();
    });
  }
  
  ngAfterViewInit() {
    // Đảm bảo margin được thiết lập đúng khi component được render
    setTimeout(() => {
      this.adjustMainMargin();
    }, 100);
    
    // Thêm listener cho resize window
    window.addEventListener('resize', () => {
      this.adjustMainMargin();
    });
  }
  
  // Xử lý sự kiện từ header component
  onSidebarToggle(isToggled: boolean) {
    console.log('Sidebar toggled event received:', isToggled);
    this.sidebarVisible = !isToggled;
    this.adjustMainMargin();
  }
  
  checkSidebarState() {
    // Kiểm tra xem sidebar có đang hiển thị không
    const hasSidebarClass = document.body.classList.contains('toggle-sidebar');
    console.log('Sidebar state:', hasSidebarClass ? 'hidden' : 'visible');
    this.sidebarVisible = !hasSidebarClass;
  }
  
  // Điều chỉnh margin dựa trên trạng thái sidebar và kích thước màn hình
  adjustMainMargin() {
    const mainElement = document.getElementById('main');
    const isSidebarToggled = document.body.classList.contains('toggle-sidebar');
    const isDesktop = window.innerWidth >= 1200;
    
    if (mainElement) {
      // Điều chỉnh margin dựa trên CSS đã định nghĩa trong SCSS
      // Code này chỉ để đảm bảo styles được áp dụng đúng
      if (isDesktop) {
        // Desktop mode
        mainElement.style.marginLeft = isSidebarToggled ? '0px' : '300px';
      } else {
        // Mobile mode
        mainElement.style.marginLeft = isSidebarToggled ? '300px' : '0px';
      }
    }
  }
}

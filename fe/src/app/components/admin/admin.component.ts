import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  ngOnInit() {
    // Debug: Kiểm tra trạng thái ban đầu
    console.log('Admin component initialized');
    console.log('Body classes:', document.body.className);
    console.log('Has toggle-sidebar class:', document.body.classList.contains('toggle-sidebar'));
    
    // Đảm bảo không có class toggle-sidebar ban đầu (sidebar hiển thị)
    document.body.classList.remove('toggle-sidebar');
    
    console.log('After removing toggle-sidebar:', document.body.classList.contains('toggle-sidebar'));
  }
}

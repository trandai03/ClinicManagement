import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { ExaminationService } from 'src/app/services/examination.service';
import { AuthService } from 'src/app/services/auth.service';
import { storageUtils } from 'src/app/utils/storage';
import { DatePipe, formatDate } from '@angular/common';
import { Hour, Hours } from 'src/app/models/hour';
import { ToastrService } from 'ngx-toastr';
import { Booking } from 'src/app/models/booking';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  ldakham: any;
  lsaptoi: any;

  dtOption: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective, { static: false })
    dtElement!: DataTableDirective;

    // Hours mapping
  hours: Hour[] = Hours.map((name, index) => ({
    id: index + 1,
    name: name,
    session: index < 4 ? 'Sáng' : (index < 6 ? 'Chiều' : 'Tối'),
    startTime: name.split(' - ')[0],
    endTime: name.split(' - ')[1]
  }));
  profileForm!: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  selectedHistory: any = null;
  isLoadingUpcoming: boolean = false;
  isLoadingCompleted: boolean = false;

  constructor(
    private formbuilder: FormBuilder,
    private authSv: AuthService, 
    private bookingSv: BookingService,
    private examinationSv: ExaminationService,
    private toastr: ToastrService
  ) {
    var pro = storageUtils.get('profile');
    this.profileForm = this.formbuilder.group({
      fullName: [
        { value: pro.fullName || '', disabled: true },
        [Validators.required, Validators.minLength(2)]
      ],
      dob: [
        { value: this.formatDateForInput(pro.dob) || '', disabled: true },
        [Validators.required]
      ],
      gender: [
        { value: pro.gender || 'MALE', disabled: true },
        [Validators.required]
      ],
      phone: [
        { value: pro.phone || '', disabled: true },
        [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]
      ],
      bhyt: [
        { value: pro.bhyt || '', disabled: true }
      ],
      address: [
        { value: pro.address || '', disabled: true },
        [Validators.required]
      ],
    });

    this.loadBookingData(pro);
  }

  ngOnInit(){
    this.dtOption = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      order: [[0, 'asc']], // Sắp xếp theo cột STT tăng dần
      columnDefs: [
        {
          targets: 0, // Cột STT
          type: 'num',
          className: 'text-center',
          orderable: false, // Không cho sắp xếp cột STT
          searchable: false
        },
        {
          targets: [1, 2, 3, 4, 5, 6], // Các cột text
          type: 'string'
        },
        {
          targets: -1, // Cột cuối (hành động)
          orderable: false,
          searchable: false,
          className: 'text-center'
        }
      ],
      language: {
        lengthMenu: "Hiển thị _MENU_ mục",
        zeroRecords: "Không tìm thấy dữ liệu",
        info: "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
        infoEmpty: "Hiển thị 0 đến 0 của 0 mục",
        infoFiltered: "(lọc từ _MAX_ tổng số mục)",
        search: "Tìm kiếm:",
        paginate: {
          first: "Đầu",
          last: "Cuối",
          next: "Tiếp",
          previous: "Trước"
        }
      },
      searching: true,
      processing: true,
      serverSide: false,
      responsive: true,
      scrollX: true
    };
  }

  checkClick: number = 1;

  clickTab(num : number) {
    this.checkClick = num;

    if (this.checkClick === 2) {
      this.loadUpcomingAppointments();
    }

    if (this.checkClick === 3) {
      this.loadCompletedAppointments();
    }
  }

  // Load lịch hẹn sắp tới  
  private loadUpcomingAppointments() {
    this.isLoadingUpcoming = true;
    this.bookingSv.getAllBooking('ACCEPTING',null,formatDate(new Date(), 'dd/MM/yyyy', 'en-US') ,null, storageUtils.get('profile').gmail).subscribe({
      next: (res) => {
        // Sắp xếp theo bookingId và thêm số thứ tự
        this.lsaptoi = this.sortBookingsById(res);
        this.isLoadingUpcoming = false;
        this.refreshDataTable();
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.lsaptoi = [];
        this.isLoadingUpcoming = false;
        this.refreshDataTable();
      }
    });
  }

  // Load lịch sử khám bệnh
  private loadCompletedAppointments() {
    this.isLoadingCompleted = true;
    this.bookingSv.getAllBooking('SUCCESS', null, null, null, storageUtils.get('profile').gmail).subscribe({
      next: (res) => {
        // Sắp xếp theo bookingId và thêm số thứ tự
        this.ldakham = this.sortBookingsById(res);
        this.isLoadingCompleted = false;
        this.refreshDataTable();
      },
      error: (error) => {
        console.error('Error loading completed appointments:', error);
        this.ldakham = [];
        this.isLoadingCompleted = false;
        this.refreshDataTable();
      }
    });
  }

  // Làm mới DataTable
  private refreshDataTable() {
    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        setTimeout(() => {
          this.dtTrigger.next(null);
        }, 100);
      });
    } else {
      setTimeout(() => {
        this.dtTrigger.next(null);
      }, 100);
    }
  }

  // Bật chế độ chỉnh sửa
  enableEditMode() {
    this.isEditMode = true;
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.enable();
    });
  }

  // Tắt chế độ chỉnh sửa và reset form
  cancelEdit() {
    this.isEditMode = false;
    this.isSubmitting = false;
    
    // Reset form về giá trị ban đầu
    const pro = storageUtils.get('profile');
    this.profileForm.patchValue({
      fullName: pro.fullName || '',
      dob: this.formatDateForInput(pro.dob) || '',
      gender: pro.gender || 'MALE',
      phone: pro.phone || '',
      bhyt: pro.bhyt || '',
      address: pro.address || ''
    });

    // Disable tất cả controls
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.disable();
    });

    // Reset validation state
    this.profileForm.markAsUntouched();
    this.profileForm.markAsPristine();
  }

  onSubmit() {
    if (!this.isEditMode) return;
    
    this.isSubmitting = true;
    
    if(this.profileForm.valid) {
      let {fullName, dob, gender, phone, bhyt, address} = this.profileForm.value;
      let dobformat = '';
      
      if(dob != '') {
        // Convert từ format YYYY-MM-DD về DD/MM/YYYY
        let s = dob.split('-');
        dobformat = s[2] + '/' + s[1] + '/' + s[0];
        dob = dobformat;
      }
      
      const id = storageUtils.get('profile').id;
      
      this.authSv.saveProffile({fullName, dob, gender, phone, bhyt, address, id}).subscribe({
        next: (response) => {
          // this.toastr.success('Cập nhật thông tin thành công!', 'Thành công');
          
          // Cập nhật storage với thông tin mới
          const updatedProfile = {
            ...storageUtils.get('profile'),
            fullName,
            dob,
            gender,
            phone,
            bhyt,
            address
          };
          storageUtils.set('profile', updatedProfile);
          
          // Tắt chế độ edit
          this.isEditMode = false;
          this.isSubmitting = false;
          
          // Disable form
          Object.keys(this.profileForm.controls).forEach(key => {
            this.profileForm.get(key)?.disable();
          });
        },
        error: (error) => {
          // this.toastr.error('Có lỗi xảy ra khi cập nhật thông tin!', 'Lỗi');
          this.isSubmitting = false;
          console.error('Error updating profile:', error);
        }
      });
    } else {
      this.toastr.warning('Vui lòng kiểm tra lại thông tin!', 'Cảnh báo');
      this.isSubmitting = false;
      
      // Mark all fields as touched để hiện validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  // Kiểm tra validation error cho field
  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} là bắt buộc`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} phải có ít nhất ${field.errors['minlength'].requiredLength} ký tự`;
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} không đúng định dạng`;
    }
    return '';
  }

  // Lấy label của field để hiện error
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'fullName': 'Họ và tên',
      'dob': 'Ngày sinh',
      'phone': 'Số điện thoại',
      'address': 'Địa chỉ'
    };
    return labels[fieldName] || fieldName;
  }

  // Load booking data
  private loadBookingData(pro: any) {
    // Load lịch sử khám bệnh (SUCCESS)
    this.bookingSv.getAllBooking('SUCCESS',null,null,null,pro.gmail).subscribe({
      next: (res) => {
        // Sắp xếp theo bookingId và thêm số thứ tự
        this.ldakham = this.sortBookingsById(res);
        this.dtTrigger.next(null);
      },
      error: (error) => {
        console.error('Error loading completed appointments:', error);
        this.ldakham = [];
      }
    });

    // Load lịch hẹn sắp tới (ACCEPTING)
    this.bookingSv.getAllBooking('ACCEPTING', null, formatDate(new Date(), 'dd/MM/yyyy', 'en-US'), null, pro.gmail).subscribe({
      next: (res) => {
        // Sắp xếp theo bookingId và thêm số thứ tự
        this.lsaptoi = this.sortBookingsById(res);
        this.dtTrigger.next(null);
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.lsaptoi = [];
      }
    });
  }

  // Format date cho input type="date" (YYYY-MM-DD)
  formatDateForInput(date: string): string {
    if (!date) return '';
    try {
      let dateObj: Date;
      if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        dateObj = new Date(date);
      }
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    try {
      let dateObj: Date;
      if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        dateObj = new Date(date);
      }
      return dateObj.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  }

  // Xem chi tiết lịch sử khám bệnh
  viewHistoryDetail(bookingId: number) {
    console.log('Viewing history detail for booking ID:', bookingId);
    
    // Tìm thông tin booking trong ldakham array
    const historyItem = this.ldakham.find((item: any) => item.id === bookingId);
    
    if (historyItem) {
      // Lấy thông tin chi tiết từ API hoặc sử dụng data hiện có
      this.loadHistoryDetail(bookingId);
    } else {
      this.toastr.error('Không tìm thấy thông tin lịch sử khám bệnh!', 'Lỗi');
    }
  }

  // Load chi tiết lịch sử từ API
  private loadHistoryDetail(bookingId: number) {
    // Gọi API để lấy chi tiết lịch sử khám bệnh
    this.examinationSv.getExaminationDetails(bookingId).subscribe({
      next: (response: any) => {
        // Map dữ liệu từ ExaminationDetailsResponse
        this.selectedHistory = {
          id: response.booking?.id || bookingId,
          historyId: response.historyId,
          name: response.booking?.name || 'Chưa cập nhật',
          email: response.booking?.email || 'Chưa cập nhật',
          phone: response.booking?.phone || 'Chưa cập nhật',
          gender: response.booking?.gender || 'Chưa cập nhật',
          dob: response.booking?.dob || 'Chưa cập nhật',
          date: response.booking?.date || 'Chưa cập nhật',
          timeSlot: response.booking?.hourName || 'Chưa cập nhật',
          nameDoctor: response.booking?.doctorName || 'Chưa cập nhật', // Cần lấy từ API khác
          major: response.booking?.major || 'Chưa cập nhật', // Cần lấy từ API khác
          hourId: response.booking?.hourId || 0,
          hourName: this.getHourText(response.booking?.hourId || 0),
          resultConclusion: response.booking?.resultsConclusion || 'Chưa cập nhật',
          resultNotes: response.booking?.resultsNotes || 'Chưa cập nhật',
          
          // Thông tin khám bệnh
          roomNumber: response.booking?.roomNumber || 'Chưa cập nhật',
          initialSymptoms: response.booking?.initialSymptoms || 'Chưa có triệu chứng',
          diagnosis: response.booking?.doctorNotes || 'Chưa có chẩn đoán',
          
          // Đơn thuốc
          prescription: response.prescriptions?.map((p: any) => ({
            name: p.medicineName,
            quantity: p.quantity,
            dosage: p.dosage,
            note: p.instructions,
            unitPrice: p.unitPrice,
            totalPrice: p.totalPrice
          })) || [],
          
          // Dịch vụ y tế
          services: response.serviceRequests?.map((s: any) => ({
            name: s.serviceName,
            description: s.description|| '-',
            price: s.cost,
            status: s.status,
            type: s.serviceType
          })) || [],
          
          // Thông tin thanh toán
          totalCost: response.paymentInfo?.totalAmount || 0,
          consultationFee: response.paymentInfo?.consultationFee || 0,
          servicesFee: response.paymentInfo?.servicesFee || 0,
          medicinesFee: response.paymentInfo?.medicinesFee || 0,
          paymentMethod: response.paymentInfo?.paymentMethod || 'Chưa cập nhật',
          paymentStatus: response.paymentInfo?.paymentStatus || 'Chưa cập nhật',
          paidAt: response.paymentInfo?.paidAt || null,
          
          // Ghi chú
          note: response.booking?.doctorNotes || 'Không có ghi chú bổ sung'
        };
        
        // Mở modal
        this.openHistoryModal();
      },
      error: (error: any) => {
        console.error('Error loading history detail:', error);
        
        // Fallback: sử dụng data cơ bản từ list
        const basicInfo = this.ldakham.find((item: any) => item.id === bookingId);
        if (basicInfo) {
          this.selectedHistory = {
            ...basicInfo,
            diagnosis: 'Thông tin chẩn đoán chưa được cập nhật',
            prescription: [],
            services: [],
            totalCost: 0,
            note: 'Không có ghi chú',
            timeSlot: 'Chưa cập nhật',
            roomNumber: 'Chưa cập nhật',
            initialSymptoms: 'Chưa có thông tin'
          };
          this.openHistoryModal();
        } else {
          this.toastr.error('Không thể tải thông tin chi tiết!', 'Lỗi');
        }
      }
    });
  }

  // Mở modal xem chi tiết
  private openHistoryModal() {
    // Sử dụng Bootstrap modal
    const modalElement = document.getElementById('historyDetailModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Lấy text hiển thị cho trạng thái dịch vụ
  getServiceStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ thực hiện',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'REQUESTED': 'Đã yêu cầu'
    };
    return statusMap[status] || 'Không xác định';
  }

  // Lấy text hiển thị cho trạng thái thanh toán
  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'Đã thanh toán',
      'PENDING': 'Chờ thanh toán',
      'FAILED': 'Thanh toán thất bại',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền'
    };
    return statusMap[status] || 'Chưa xác định';
  }
  getHourText(hourId: number): string {
    const hour = this.hours.find(h => h.id === hourId);
    return hour ? hour.name : 'Không xác định';
  }

  // Làm mới toàn bộ dữ liệu
  refreshAllData() {
    const pro = storageUtils.get('profile');
    this.loadBookingData(pro);
  }
  // Xuất báo cáo lịch sử khám bệnh
  exportHistoryReport() {
    if (!this.selectedHistory) {
      this.toastr.error('Không có thông tin để xuất báo cáo!', 'Lỗi');
      return;
    }

    console.log('Exporting history report for:', this.selectedHistory.id);
    
    // Tạm thời export bằng cách in chi tiết (cho đến khi có API)
    this.printHistoryDetail();
  }

  // In chi tiết lịch sử khám bệnh
  private printHistoryDetail() {
    const printContent = this.generatePrintableContent();
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lịch sử khám bệnh - ${this.selectedHistory.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; color: #333; margin-bottom: 10px; }
              .info-row { display: flex; margin-bottom: 5px; }
              .label { font-weight: bold; width: 150px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total-cost { font-size: 18px; font-weight: bold; color: #e74c3c; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    this.toastr.success('Đã mở cửa sổ in báo cáo!', 'Thành công');
  }

  // Tạo nội dung để in
  private generatePrintableContent(): string {
    const history = this.selectedHistory;
    let content = `
      <div class="header">
        <h1>PHÒNG KHÁM AN KHANG</h1>
        <h2>LỊCH SỬ KHÁM BỆNH</h2>
      </div>
      
      <div class="section">
        <div class="section-title">THÔNG TIN BỆNH NHÂN</div>
        <div class="info-row"><span class="label">Họ và tên:</span> ${history.name}</div>
        <div class="info-row"><span class="label">Ngày sinh:</span> ${this.formatDate(history.dob)}</div>
        <div class="info-row"><span class="label">Giới tính:</span> ${history.gender === 'MALE' ? 'Nam' : 'Nữ'}</div>
        <div class="info-row"><span class="label">Số điện thoại:</span> ${history.phone || 'Chưa cập nhật'}</div>
      </div>
      
      <div class="section">
        <div class="section-title">THÔNG TIN KHÁM BỆNH</div>
        <div class="info-row"><span class="label">Ngày khám:</span> ${this.formatDate(history.date)}</div>
        <div class="info-row"><span class="label">Giờ khám:</span> ${this.getHourText(history.hourId)}</div>
        <div class="info-row"><span class="label">Bác sĩ khám:</span> ${history.nameDoctor}</div>
        <div class="info-row"><span class="label">Chuyên khoa:</span> ${history.major}</div>
      </div>
    `;

    if (history.diagnosis) {
      content += `
        <div class="section">
          <div class="section-title">CHẨN ĐOÁN</div>
          <p>${history.diagnosis}</p>
        </div>
      `;
    }

    if (history.prescription && history.prescription.length > 0) {
      content += `
        <div class="section">
          <div class="section-title">ĐỀN THUỐC</div>
          <table>
            <thead>
              <tr><th>Tên thuốc</th><th>Số lượng</th><th>Cách dùng</th><th>Ghi chú</th></tr>
            </thead>
            <tbody>
      `;
      history.prescription.forEach((med: any) => {
        content += `<tr><td>${med.name}</td><td>${med.quantity}</td><td>${med.dosage}</td><td>${med.note || '-'}</td></tr>`;
      });
      content += `</tbody></table></div>`;
    }

    if (history.services && history.services.length > 0) {
      content += `
        <div class="section">
          <div class="section-title">DỊCH VỤ Y TẾ</div>
          <table>
            <thead>
              <tr><th>Tên dịch vụ</th><th>Mô tả</th><th>Giá tiền</th></tr>
            </thead>
            <tbody>
      `;
      history.services.forEach((service: any) => {
        content += `<tr><td>${service.name}</td><td>${service.description || '-'}</td><td>${service.price?.toLocaleString('vi-VN')} VNĐ</td></tr>`;
      });
      content += `</tbody></table></div>`;
    }

    if (history.totalCost) {
      content += `
        <div class="section">
          <div class="section-title">TỔNG CHI PHÍ</div>
          <div class="total-cost">${history.totalCost.toLocaleString('vi-VN')} VNĐ</div>
        </div>
      `;
    }
    if (history.resultConclusion) {
      content += `
        <div class="section">
          <div class="section-title">KẾT LUẬN</div>
          <p>${history.resultConclusion}</p>
        </div>
      `;
    }
    if (history.resultNotes) {
      content += `
        <div class="section">
          <div class="section-title">GHI CHÚ</div>
          <p>${history.resultNotes}</p>
        </div>
      `;
    }

    content += `
      <div style="margin-top: 50px; text-align: right;">
        <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    `;

    return content;
  }
  trackByFn(index: number, booking: Booking): number {
    return booking.id;
  }

  // Phương thức helper để sắp xếp và đánh số thứ tự
  private sortBookingsById(bookings: any[]): any[] {
    return bookings
      .sort((a: any, b: any) => b.id - a.id) // Sắp xếp theo bookingId từ lớn đến bé (mới nhất trước)
      .map((item: any, index: number) => ({
        ...item,
        stt: index + 1 // Thêm số thứ tự sau khi sắp xếp
      }));
  }
}

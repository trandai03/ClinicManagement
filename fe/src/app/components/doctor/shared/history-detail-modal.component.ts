import { Component, Input, Output, EventEmitter } from '@angular/core';
import { History, HistoryDetails, PrescriptionDetail, ServiceRequestDetail, PaymentInfo } from 'src/app/models/history';
import { HistoryService } from 'src/app/services/history.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-history-detail-modal',
  template: `
    <div class="modal fade" id="historyDetailModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-medical"></i> Chi tiết Lịch sử Khám bệnh
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body" *ngIf="history">
            <!-- Patient Information -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h6><i class="fas fa-user"></i> Thông tin Bệnh nhân</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Họ tên:</strong> {{history.patientName}}</p>
                    <p><strong>Email:</strong> {{history.patientEmail}}</p>
                    <p><strong>Điện thoại:</strong> {{history.patientPhone}}</p>
                    <p><strong>Giới tính:</strong> {{history.patientGender}}</p>
                    <p><strong>Địa chỉ:</strong> {{history.patientAddress}}</p>
                    <p *ngIf="history.bhyt"><strong>BHYT:</strong> {{history.bhyt}}</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h6><i class="fas fa-user-md"></i> Thông tin Bác sĩ</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Bác sĩ:</strong> {{history.doctorName}}</p>
                    <p><strong>Chuyên khoa:</strong> {{history.majorName}}</p>
                    <p><strong>Ngày khám:</strong> {{formatDateTime(history.examinationDate)}}</p>
                    <p><strong>Thời gian:</strong> 
                      {{formatDateTime(history.startTime)}} - {{formatDateTime(history.endTime)}}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div class="card mb-4">
              <div class="card-header">
                <h6><i class="fas fa-stethoscope"></i> Thông tin Y tế</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label><strong>Tóm tắt khám bệnh:</strong></label>
                    <p class="border p-2 rounded">{{history.medicalSummary}}</p>
                  </div>
                  
                  <div class="col-md-6 mb-3" *ngIf="history.diagnosis">
                    <label><strong>Chẩn đoán:</strong></label>
                    <p class="border p-2 rounded">{{history.diagnosis}}</p>
                  </div>
                  
                  <div class="col-md-6 mb-3" *ngIf="history.treatment">
                    <label><strong>Phương pháp điều trị:</strong></label>
                    <p class="border p-2 rounded">{{history.treatment}}</p>
                  </div>
                  
                  <div class="col-md-12" *ngIf="history.doctorNotes">
                    <label><strong>Ghi chú của bác sĩ:</strong></label>
                    <p class="border p-2 rounded">{{history.doctorNotes}}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Prescriptions -->
            <div class="card mb-4" *ngIf="historyDetails?.prescriptions?.length">
              <div class="card-header">
                <h6><i class="fas fa-pills"></i> Đơn thuốc</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Tên thuốc</th>
                        <th>Số lượng</th>
                        <th>Liều dùng</th>
                        <th>Hướng dẫn sử dụng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let prescription of historyDetails.prescriptions">
                        <td>{{prescription.medicineName}}</td>
                        <td>{{prescription.quantity}}</td>
                        <td>{{prescription.dosage}}</td>
                        <td>{{prescription.instructions}}</td>
                        <td>{{formatCurrency(prescription.unitPrice)}}</td>
                        <td>{{formatCurrency(prescription.totalPrice)}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Service Requests -->
            <div class="card mb-4" *ngIf="historyDetails?.serviceRequests?.length">
              <div class="card-header">
                <h6><i class="fas fa-cogs"></i> Dịch vụ Y tế</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Tên dịch vụ</th>
                        <th>Loại</th>
                        <th>Trạng thái</th>
                        <th>Chi phí</th>
                        <th>Ghi chú yêu cầu</th>
                        <th>Kết quả</th>
                        <th>Ngày thực hiện</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let service of historyDetails.serviceRequests">
                        <td>{{service.serviceName}}</td>
                        <td>{{service.serviceType}}</td>
                        <td>
                          <span class="badge" [ngClass]="getServiceStatusClass(service.status)">
                            {{getServiceStatusText(service.status)}}
                          </span>
                        </td>
                        <td>{{formatCurrency(service.cost)}}</td>
                        <td>{{service.requestNotes || 'Không có'}}</td>
                        <td>{{service.resultNotes || 'Chưa có kết quả'}}</td>
                        <td>{{formatDateTime(service.requestedAt)}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="card">
              <div class="card-header">
                <h6><i class="fas fa-money-bill"></i> Thông tin Thanh toán</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <table class="table table-borderless">
                      <tr>
                        <td><strong>Phí khám:</strong></td>
                        <td class="text-end">{{formatCurrency(history.consultationFee)}}</td>
                      </tr>
                      <tr *ngIf="history.medicineFee">
                        <td><strong>Phí thuốc:</strong></td>
                        <td class="text-end">{{formatCurrency(history.medicineFee)}}</td>
                      </tr>
                      <tr *ngIf="history.serviceFee">
                        <td><strong>Phí dịch vụ:</strong></td>
                        <td class="text-end">{{formatCurrency(history.serviceFee)}}</td>
                      </tr>
                      <tr class="border-top">
                        <td><strong>Tổng cộng:</strong></td>
                        <td class="text-end"><strong>{{formatCurrency(history.totalAmount)}}</strong></td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="col-md-6" *ngIf="historyDetails?.paymentInfo">
                    <p><strong>Phương thức thanh toán:</strong> {{historyDetails.paymentInfo.paymentMethod}}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span class="badge badge-success">{{historyDetails.paymentInfo.paymentStatus}}</span>
                    </p>
                    <p *ngIf="historyDetails.paymentInfo.paidAt">
                      <strong>Ngày thanh toán:</strong> {{formatDateTime(historyDetails.paymentInfo.paidAt)}}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" (click)="downloadPDF()" *ngIf="history">
              <i class="fas fa-download"></i> Tải PDF
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    
    .badge.badge-requested { background-color: #ffc107; }
    .badge.badge-in-progress { background-color: #17a2b8; }
    .badge.badge-completed { background-color: #28a745; }
    .badge.badge-cancelled { background-color: #dc3545; }
    .badge.badge-success { background-color: #28a745; }
    
    .table td {
      vertical-align: middle;
    }
    
    .border {
      border: 1px solid #dee2e6 !important;
    }
  `]
})
export class HistoryDetailModalComponent {
  @Input() history: History | null = null;
  @Input() historyDetails: HistoryDetails | null = null;
  @Output() downloadRequested = new EventEmitter<number>();

  constructor(
    private historyService: HistoryService,
    private toastr: ToastrService
  ) {}

  downloadPDF() {
    if (this.history?.bookingId) {
      this.historyService.downloadHistoryPDF(this.history.bookingId);
      this.downloadRequested.emit(this.history.bookingId);
    }
  }

  formatCurrency(amount: number): string {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDateTime(dateTime: string | Date): string {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('vi-VN');
  }

  getServiceStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'badge-requested',
      'IN_PROGRESS': 'badge-in-progress',
      'COMPLETED': 'badge-completed',
      'CANCELLED': 'badge-cancelled'
    };
    return statusMap[status] || 'badge-secondary';
  }

  getServiceStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'Đã yêu cầu',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }
} 
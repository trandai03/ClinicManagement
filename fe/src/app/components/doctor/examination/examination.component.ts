import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BookingService } from 'src/app/services/booking.service';
import { MedicineService } from '../../../services/medician.service';
import { MedicalServiceService } from 'src/app/services/medical-service.service';
import { HistoryService } from 'src/app/services/history.service';
import { ExaminationService } from 'src/app/services/examination.service';
import { ServiceRequestService, ServiceRequestModel,ServiceRequestDTO } from 'src/app/services/service-request.service';
import { PrescriptionService } from 'src/app/services/prescription.service';
import { PaymentService, PaymentResponse } from '../../../services/payment.service';
import { ReportService } from 'src/app/services/report.service';

import { Booking } from 'src/app/models/booking';
import { Medicine } from 'src/app/models/medicine';
import { ExaminationStartDTO, ExaminationCompletionDTO, MedicineData, ServiceData } from 'src/app/models/examination.dto';
import { ToastService } from 'src/app/services/toast.service';
export interface MedicalService {
  id: number;
  name: string;
  money: number;
  description?: string;
}

@Component({
  selector: 'app-examination',
  templateUrl: './examination.component.html',
  styleUrls: ['./examination.component.scss']
})
export class ExaminationComponent implements OnInit {

  bookingId!: number;
  historyId!: number; // ID của bản ghi history sau khi bắt đầu khám
  currentBooking?: Booking; // Make optional để tránh lỗi undefined
  isLoadingBooking = true; // Add loading state

  // Forms
  examinationForm!: FormGroup;
  prescriptionForm!: FormGroup;
  serviceRequestForm!: FormGroup;
  paymentForm!: FormGroup;

  // Master data
  availableMedicines: Medicine[] = [];
  availableServices: MedicalService[] = [];
  selectedMedicines: any[] = [];
  selectedServices: ServiceRequestModel[] = [];

  // UI State
  currentStep: 'EXAMINATION' | 'SERVICES' | 'PRESCRIPTION' | 'PAYMENT' = 'EXAMINATION';
  totalCost = 0;
  consultationFee = 200000; // Base consultation fee

  // Payment processing state
  isProcessingPayment = false;
  showMoMoOption = false;
  showExportModal = false; // Trạng thái hiển thị modal xuất báo cáo

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private bookingService: BookingService,
    private medicineService: MedicineService,
    private medicalServiceService: MedicalServiceService,
    private historyService: HistoryService,
    private examinationService: ExaminationService,
    private serviceRequestService: ServiceRequestService,
    private prescriptionService: PrescriptionService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private toastService: ToastService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    console.log('ExaminationComponent - ngOnInit started');
    
    // Clear any lingering modal states from previous components
    this.clearModalStates();
    
    this.initializeForms();
    this.loadMasterData();
    this.bookingId = +this.route.snapshot.paramMap.get('id')!;
    console.log('Booking ID extracted:', this.bookingId);
    
    // Subscribe to query params first
    this.route.queryParams.subscribe(queryParams => {
      console.log('Query params in examination:', queryParams);
      if (queryParams['step']) {
        this.currentStep = queryParams['step'] as any;
        console.log('Step set from query params:', this.currentStep);
        
        // Force change detection
        setTimeout(() => {
          console.log('After timeout - currentStep:', this.currentStep);
        }, 100);
      }
    });
    
    this.loadBookingData();
  }

  private clearModalStates() {
    console.log('Clearing modal states...');
    
    // Remove all modal backdrops
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => {
      console.log('Removing modal backdrop');
      backdrop.remove();
    });
    
    // Hide all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('show');
      (modal as HTMLElement).style.display = 'none';
    });
    
    // Reset body classes and styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    console.log('Modal states cleared');
  }

  initializeForms() {
    this.examinationForm = this.fb.group({
      symptoms: ['', Validators.required],
      diagnosis: [''],
      doctorNotes: ['', Validators.required],
      roomNumber: ['P001']
    });

    this.prescriptionForm = this.fb.group({
      selectedMedicine: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      dosage: ['', Validators.required],
      instructions: ['', Validators.required]
    });

    this.serviceRequestForm = this.fb.group({
      selectedService: [''],
      notes: ['']
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['CASH', Validators.required],
      buyMedicineAtClinic: [true, Validators.required], // Default: mua thuốc tại phòng khám
      discountAmount: [0],
      notes: ['']
    });
  }

  loadBookingData() {
    this.isLoadingBooking = true;
    
    // Include AWAITING_RESULTS in possible statuses for examination
    const possibleStatuses = ['ACCEPTING', 'IN_PROGRESS', 'AWAITING_RESULTS'];
    
    // Try to find booking in any of these statuses
    const requests = possibleStatuses.map(status => 
      this.bookingService.getAllBooking(status, null, null, null, null)
    );
    
    forkJoin(requests).subscribe({
      next: (results: Booking[][]) => {
        // Flatten all results and find our booking
        const allBookings = results.flat();
        const foundBooking = allBookings.find((b: Booking) => b.id === this.bookingId);
        
        if (foundBooking) {
          this.currentBooking = foundBooking;
          this.isLoadingBooking = false;
          
          console.log('Found booking:', this.currentBooking);
          console.log('Current booking status:', this.currentBooking.status);
          
          // Set appropriate step based on booking status (only if not overridden by query params)
          this.route.queryParams.subscribe(queryParams => {
            if (queryParams['step']) {
              this.currentStep = queryParams['step'] as any;
              console.log('Step set from query params:', this.currentStep);
            } else {
              // Always start from EXAMINATION step when entering from booking
              // Only jump to other steps when explicitly specified via query params
              this.currentStep = 'EXAMINATION';
              console.log('Starting from EXAMINATION step for booking status:', this.currentBooking!.status);
              
              // Pre-fill examination form based on booking status
              if (this.currentBooking!.status === 'ACCEPTING') {
                this.examinationForm.patchValue({
                  symptoms: '',  // Leave empty for doctor to fill
                  doctorNotes: '', // Leave empty for doctor to fill
                  roomNumber: 'P001'
                });
              } else if (this.currentBooking!.status === 'IN_PROGRESS') {
                // Even for IN_PROGRESS, start from EXAMINATION but with some pre-filled data
                this.examinationForm.patchValue({
                  symptoms: '',  // Let doctor fill in symptoms
                  doctorNotes: '', // Let doctor fill in notes
                  roomNumber: 'P001'
                });
              } else if (this.currentBooking!.status === 'AWAITING_RESULTS') {
                // For AWAITING_RESULTS, we can jump to PRESCRIPTION with pre-filled data
                this.currentStep = 'PRESCRIPTION';
                this.examinationForm.patchValue({
                  symptoms: 'Đã hoàn thành xét nghiệm',
                  doctorNotes: 'Có kết quả xét nghiệm, tiếp tục khám',
                  roomNumber: 'P001'
                });
              }
            }
          });
          
        } else {
          this.isLoadingBooking = false;
          console.error('Booking not found with ID:', this.bookingId);
          this.toastService.showError('Không tìm thấy thông tin lịch khám!', 'Lỗi');
          this.router.navigate(['/doctor/today-schedule']);
        }
      },
      error: (error) => {
        this.isLoadingBooking = false;
        console.error('Error loading booking data:', error);
        this.toastService.showError('Có lỗi khi tải thông tin lịch khám!', 'Lỗi');
        this.router.navigate(['/doctor/today-schedule']);
      }
    });
  }

  loadMasterData() {
    forkJoin({
      medicines: this.medicineService.getAllMedicine(),
      services: this.medicalServiceService.getAllMedicalService()
    }).subscribe(({ medicines, services }) => {
      this.availableMedicines = medicines;
      this.availableServices = services;
      this.calculateTotalCost();
    });
  }

  // ===== WORKFLOW METHODS =====

  startExamination() {
    console.log('startExamination called');
    console.log('Form values:', this.examinationForm.value);
    
    // Set default values if empty
    const symptoms = this.examinationForm.value.symptoms || 'Bắt đầu khám bệnh';
    const doctorNotes = this.examinationForm.value.doctorNotes || 'Đang thực hiện khám lâm sàng';
    const roomNumber = this.examinationForm.value.roomNumber || 'P001';
    
    // Update form with default values
    this.examinationForm.patchValue({
      symptoms: symptoms,
      doctorNotes: doctorNotes,
      roomNumber: roomNumber
    });

    const startData: ExaminationStartDTO = {
      roomNumber: roomNumber,
      initialSymptoms: symptoms,
      doctorNotes: doctorNotes
    };

    this.examinationService.startExamination(this.bookingId, startData).subscribe({
      next: (response: any) => {
        this.currentBooking!.status = 'IN_PROGRESS';
        this.currentStep = 'SERVICES';
        console.log('Successfully updated to IN_PROGRESS, moved to SERVICES step');
        
        // Lấy historyId từ response
        if (response && response.data && response.data.historyId) {
          this.historyId = response.data.historyId;
          console.log('Saved historyId:', this.historyId);
        } else {
          console.warn('No historyId in response, using bookingId as fallback');
          this.historyId = this.bookingId;
        }
      },
      error: (err: any) => {
        console.error('Error updating booking to IN_PROGRESS:', err);
        this.toastService.showError('Có lỗi khi cập nhật trạng thái: ' + err.message, 'Lỗi');
      }
    });
  }

  // Add medicine to prescription
  addMedicine() {
    if (this.prescriptionForm.get('selectedMedicine')?.value) {
      const formData = this.prescriptionForm.value;
      const medicine = this.availableMedicines.find(m => m.id == formData.selectedMedicine);
      
      if (medicine) {
        this.selectedMedicines.push({
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity: formData.quantity,
          dosage: formData.dosage,
          instructions: formData.instructions,
          unitPrice: medicine.money,
          totalPrice: medicine.money * formData.quantity
        });
        
        this.prescriptionForm.reset({ quantity: 1 });
        this.calculateTotalCost();
      }
    }
  }

  // Add service request
  addServiceRequest() {
    if (this.serviceRequestForm.get('selectedService')?.value) {
      const formData = this.serviceRequestForm.value;
      const service = this.availableServices.find(s => s.id == formData.selectedService);
      
      if (service) {
        const serviceRequest: ServiceRequestModel = {
          id: service.id,
          bookingId: this.bookingId,
          serviceName: service.name,
          serviceType: 'MEDICAL_SERVICE',
          status: 'REQUESTED',
          cost: service.money,
          requestNotes: formData.notes,
          requestedAt: new Date().toISOString()
        };
        
        this.selectedServices.push(serviceRequest);
        this.serviceRequestForm.reset();
        this.calculateTotalCost();
      }
    }
  }

  // Navigate to next step - enhanced workflow with AWAITING_RESULTS
  proceedToNextStep() {
    console.log('proceedToNextStep called, currentStep:', this.currentStep);
    console.log('Form validity:', this.canProceed());
    
    switch (this.currentStep) {
      case 'EXAMINATION':
        console.log('Processing examination form...');
        if (this.examinationForm.valid) {
          this.startExamination();
        } else {
          console.log('Examination form is invalid:', this.examinationForm.errors);
          this.toastService.showError('Vui lòng điền đầy đủ thông tin khám bệnh', 'Lỗi');
        }
        break;
      case 'SERVICES':
        console.log('Processing services, selectedServices.length:', this.selectedServices.length);
        if (this.selectedServices.length > 0) {
          this.saveServiceRequests();
        } else {
          console.log('No services selected, moving to prescription...');
          this.currentStep = 'PRESCRIPTION';
        }
        break;
      case 'PRESCRIPTION':
        console.log('Processing prescriptions, selectedMedicines.length:', this.selectedMedicines.length);
        
        // Lưu đơn thuốc vào backend trước khi chuyển sang payment
        if (this.selectedMedicines.length > 0) {
          this.savePrescriptions();
        } else {
          console.log('No medicines prescribed, moving to payment...');
          this.currentStep = 'PAYMENT';
        }
        break;
      case 'PAYMENT':
        console.log('Processing payment...');
        this.handlePayment();
        break;
    }
  }

  // Lưu đơn thuốc vào backend
  savePrescriptions() {
    // Kiểm tra historyId trước khi lưu
    if (!this.historyId) {
      console.error('No historyId available, cannot save prescriptions');
      this.toastService.showError('Chưa có thông tin khám bệnh, không thể lưu đơn thuốc', 'Lỗi');
      this.currentStep = 'PAYMENT'; // Vẫn cho phép chuyển sang payment
      return;
    }

    const prescriptionRequests = this.selectedMedicines.map(medicine => ({
      medicineId: medicine.medicineId,
      quantity: medicine.quantity,
      dosage: medicine.dosage,
      instructions: medicine.instructions
    }));

    const bulkRequest = {
      historyId: this.historyId,
      prescriptions: prescriptionRequests
    };

    console.log('Saving prescriptions with historyId:', this.historyId, bulkRequest);

    this.prescriptionService.createPrescriptions(bulkRequest).subscribe({
      next: (response) => {
        console.log('Prescriptions saved successfully:', response);
        this.toastService.showSuccess('Đã lưu đơn thuốc thành công', 'Thành công');
        this.currentStep = 'PAYMENT';
      },
      error: (err: any) => {
        console.error('Error saving prescriptions:', err);
        this.toastService.showError('Lỗi khi lưu đơn thuốc: ' + (err.error?.message || err.message), 'Lỗi');
        // Vẫn cho phép chuyển sang payment nếu có lỗi
        this.currentStep = 'PAYMENT';
      }
    });
  }

  // Lưu các service requests vào backend
  saveServiceRequests() {
    // Kiểm tra historyId trước khi lưu
    if (!this.historyId) {
      console.error('No historyId available, cannot save service requests');
      this.toastService.showError('Chưa có thông tin khám bệnh, không thể lưu yêu cầu dịch vụ', 'Lỗi');
      this.currentStep = 'PRESCRIPTION'; // Vẫn cho phép chuyển sang prescription
      return;
    }

    const serviceRequests = this.selectedServices.map(service => ({
      historyId: this.historyId,
      serviceId: service.id,
      notes: service.requestNotes || '',
      cost: service.cost
    }));

    console.log('Saving service requests with historyId:', this.historyId, serviceRequests);

    // Tạo requests song song cho tất cả services
        // const saveRequests = serviceRequests.map(request => 
        //   this.serviceRequestService.createServiceRequest(this.bookingId, [request])
        // );
    const saveRequests = this.serviceRequestService.createServiceRequest(this.bookingId, serviceRequests);

    // Sử dụng forkJoin để save tất cả cùng lúc
    forkJoin(saveRequests).subscribe({
      next: (responses) => {
        console.log('Service requests saved successfully:', responses);
        this.moveToAwaitingResults();
        // this.currentStep = 'PRESCRIPTION';
      },
      error: (err: any) => {
        console.error('Error saving service requests:', err);
        this.toastService.showError('Lỗi khi lưu yêu cầu dịch vụ: ' + (err.error?.message || err.message), 'Lỗi');
        // Vẫn cho phép chuyển sang prescription nếu có lỗi
        this.currentStep = 'PRESCRIPTION';
      }
    });
  }

  // Move booking to awaiting results status for lab tests/services
  moveToAwaitingResults() {
    this.bookingService.updateBooking(this.bookingId, 'AWAITING_RESULTS').subscribe({
      next: () => {
        this.toastService.showSuccess('Đã chỉ định dịch vụ/xét nghiệm. Bệnh nhân sẽ thực hiện và quay lại để tiếp tục khám.', 'Thành công');
        this.router.navigate(['/doctor/today-schedule']);
      },
      error: (err: any) => {
        console.error('Error updating booking status:', err);
        this.toastService.showError('Có lỗi khi cập nhật trạng thái', 'Lỗi');
      }
    });
  }

  // Go back to previous step
  goBack() {
    switch (this.currentStep) {
      case 'SERVICES':
        this.currentStep = 'EXAMINATION';
        break;
      case 'PRESCRIPTION':
        this.currentStep = 'SERVICES';
        break;
      case 'PAYMENT':
        this.currentStep = 'PRESCRIPTION';
        break;
    }
  }

  // Complete examination using ExaminationService
  completeExamination() {
    if (this.paymentForm.valid) {
      // Prepare medicine data for DTO
      const medicineData: MedicineData[] = this.selectedMedicines.map((item: any) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        dosage: item.dosage,
        instructions: item.instructions
      }));

      // Prepare service data for DTO
      const serviceData: ServiceData[] = this.selectedServices.map((item: ServiceRequestModel) => ({
        serviceId: item.id,
        cost: item.cost,
        requestNotes: item.requestNotes || ''
      }));

      // Get medicine purchase info
      const buyMedicineAtClinic = this.paymentForm.value.buyMedicineAtClinic;
      const medicinePurchaseNote = this.hasMedicines() ? 
        (buyMedicineAtClinic ? 'Mua thuốc tại phòng khám' : 'Bệnh nhân tự mua thuốc ngoài') : 
        'Không có thuốc được kê';

      // Create comprehensive notes
      const notes = [
        this.examinationForm.value.doctorNotes,
        this.paymentForm.value.notes || '',
        `Thanh toán: ${this.paymentForm.value.paymentMethod}`,
        medicinePurchaseNote
      ].filter(note => note.trim()).join(' | ');

      // Create completion DTO with actual total cost
      const completionData: ExaminationCompletionDTO = {
        bookingId: this.bookingId,
        medicines: medicineData,
        services: serviceData,
        totalAmount: this.getActualTotalCost(), // Use actual total cost
        paymentMethod: this.paymentForm.value.paymentMethod || 'CASH',
        notes: notes
      };

      console.log('Completing examination with data:', {
        ...completionData,
        medicinePurchaseInfo: {
          buyAtClinic: buyMedicineAtClinic,
          medicineCount: this.selectedMedicines.length,
          medicineCost: this.getMedicineCost(),
          actualTotal: this.getActualTotalCost()
        }
      });

      this.examinationService.completeExamination(completionData).subscribe({
        next: (response) => {
          this.toastService.showSuccess('Khám bệnh hoàn tất!', 'Thành công');
          
          // Lưu historyId để xuất báo cáo
          if (response && response.data && response.data.historyId) {
            this.historyId = response.data.historyId;
          }
          
          // Hiển thị modal xuất báo cáo
          this.showExportReportModal();
        },
        error: (err: any) => {
          console.error('Error completing examination:', err);
          this.toastService.showError('Có lỗi xảy ra khi hoàn thành khám bệnh: ' + err.error?.message, 'Lỗi');
        }
      });
    }
  }

  calculateTotalCost() {
    const medicineCost = this.selectedMedicines.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceCost = this.selectedServices.reduce((sum, item) => sum + item.cost, 0);
    this.totalCost = this.consultationFee + medicineCost + serviceCost;
    
    // Log for debugging
    console.log('Total cost calculated:', {
      consultationFee: this.consultationFee,
      medicineCost: medicineCost,
      serviceCost: serviceCost,
      totalCost: this.totalCost,
      actualTotalCost: this.getActualTotalCost()
    });
  }

  // Remove items
  removeMedicine(index: number) {
    this.selectedMedicines.splice(index, 1);
    this.calculateTotalCost();
  }

  removeService(index: number) {
    this.selectedServices.splice(index, 1);
    this.calculateTotalCost();
  }

  // Cost getters
  getMedicineCost(): number {
    return this.selectedMedicines.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  getServiceCost(): number {
    console.log('Selected services:', this.selectedServices);
    return this.selectedServices.reduce((sum, item) => sum + item.cost, 0);
  }

  // Utility methods
  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMING': 'Chờ xác nhận',
      'ACCEPTING': 'Đã xác nhận',
      'IN_PROGRESS': 'Đang khám',
      'SUCCESS': 'Hoàn thành'
    };
    return statusMap[status] || status;
  }

  isStepCompleted(step: string): boolean {
    const steps = ['EXAMINATION', 'SERVICES', 'PRESCRIPTION', 'PAYMENT'];
    const currentIndex = steps.indexOf(this.currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  }

  canProceed(): boolean {
    let canProceed = false;
    
    switch (this.currentStep) {
      case 'EXAMINATION':
        canProceed = this.examinationForm.valid;
        console.log('Can proceed EXAMINATION:', canProceed, 'Form valid:', this.examinationForm.valid);
        break;
      case 'SERVICES':
      case 'PRESCRIPTION':
        canProceed = true; // Optional steps
        console.log('Can proceed (optional step):', canProceed);
        break;
      case 'PAYMENT':
        canProceed = this.paymentForm.valid;
        console.log('Can proceed PAYMENT:', canProceed, 'Form valid:', this.paymentForm.valid);
        break;
      default:
        canProceed = false;
        console.log('Can proceed (default):', canProceed);
    }
    
    return canProceed;
  }

  /**
   * Get tooltip text for proceed button
   */
  getButtonTooltip(): string {
    if (this.canProceed()) {
      return '';
    }
    
    switch (this.currentStep) {
      case 'EXAMINATION':
        const missingFields = [];
        if (this.examinationForm.get('symptoms')?.invalid) {
          missingFields.push('triệu chứng ban đầu');
        }
        if (this.examinationForm.get('doctorNotes')?.invalid) {
          missingFields.push('ghi chú của bác sĩ');
        }
        return `Vui lòng điền: ${missingFields.join(', ')}`;
      case 'PAYMENT':
        return 'Vui lòng chọn phương thức thanh toán';
      default:
        return '';
    }
  }

  cancelExamination() {
    if (confirm('Bạn có chắc muốn hủy bỏ phiên khám này?')) {
      this.router.navigate(['/doctor/today-schedule']);
    }
  }

  // Add method to manually set step (for debugging)
  forceSetStep(step: 'EXAMINATION' | 'SERVICES' | 'PRESCRIPTION' | 'PAYMENT') {
    console.log('Force setting step to:', step);
    this.currentStep = step;
  }

  /**
   * Xử lý khi thay đổi phương thức thanh toán
   */
  onPaymentMethodChange(event: any) {
    const selectedMethod = event.target.value;
    console.log('Payment method changed to:', selectedMethod);
    
    if (selectedMethod === 'MOMO') {
      this.showMoMoOption = true;
    } else {
      this.showMoMoOption = false;
    }
  }

  /**
   * Xử lý thanh toán dựa trên phương thức được chọn
   */
  handlePayment() {
    if (!this.paymentForm.valid) {
      this.toastService.showError('Vui lòng chọn phương thức thanh toán', 'Lỗi');
      return;
    }

    const paymentMethod = this.paymentForm.value.paymentMethod;
    
    if (paymentMethod === 'MOMO') {
      this.processMoMoPayment();
    } else {
      // Xử lý các phương thức thanh toán khác (tiền mặt, thẻ, chuyển khoản, bảo hiểm)
      this.processTraditionalPayment();
    }
  }

  /**
   * Xử lý thanh toán MoMo
   */
  processMoMoPayment() {
    this.isProcessingPayment = true;
    
    this.paymentService.createMoMoPayment(this.bookingId, this.getActualTotalCost()).subscribe({
      next: (response: PaymentResponse) => {
        console.log('MoMo payment URL received:', response);
        
        if (response.data) {
          // Hiển thị thông báo cho người dùng
          this.toastService.showInfo('Đang chuyển hướng đến trang thanh toán MoMo...', 'Thông báo');
          
          // Lưu bookingId vào localStorage để sử dụng sau khi redirect
          localStorage.setItem('momo_booking_id', this.bookingId.toString());
          
          // Mở trang thanh toán MoMo trong tab hiện tại (sẽ redirect về examination-report)
          window.location.href = response.data;
        } else {
          this.toastService.showError('Không thể tạo liên kết thanh toán MoMo', 'Lỗi');
        }
        
        this.isProcessingPayment = false;
      },
      error: (error) => {
        console.error('Error creating MoMo payment:', error);
        this.toastService.showError('Lỗi khi tạo thanh toán MoMo: ' + (error.error?.message || error.message), 'Lỗi');
        this.isProcessingPayment = false;
      }
    });
  }

  /**
   * Xử lý các phương thức thanh toán truyền thống
   */
  processTraditionalPayment() {
    // Hoàn thành khám bệnh với phương thức thanh toán đã chọn
    this.completeExamination();
  }

  /**
   * Hiển thị modal xuất báo cáo
   */
  showExportReportModal() {
    this.showExportModal = true;
  }

  /**
   * Đóng modal xuất báo cáo
   */
  closeExportReportModal() {
    this.showExportModal = false;
  }

  /**
   * Xuất hóa đơn thanh toán
   */
  exportInvoice() {
    if (!this.historyId) {
      this.toastService.showError('Không tìm thấy thông tin lịch sử khám', 'Lỗi');
      return;
    }

    this.toastService.showInfo('Đang tạo hóa đơn...', 'Thông báo');
    this.reportService.downloadInvoice(this.historyId, this.currentBooking?.name);
    this.closeExportReportModal();
  }

  /**
   * Xuất đơn thuốc
   */
  exportPrescription() {
    if (!this.historyId) {
      this.toastService.showError('Không tìm thấy thông tin lịch sử khám', 'Lỗi');
      return;
    }

    this.toastService.showInfo('Đang tạo đơn thuốc...', 'Thông báo');
    this.reportService.downloadPrescription(this.historyId, this.currentBooking?.name);
    this.closeExportReportModal();
  }

  /**
   * Hoàn thành khám và chuyển về trang danh sách
   */
  finishAndGoToSchedule() {
    this.closeExportReportModal();
    this.router.navigate(['/doctor/today-schedule']);
  }

  /**
   * Lấy tổng chi phí thực tế (bao gồm phí khám + thuốc + dịch vụ)
   */
  getActualTotalCost(): number {
    return this.consultationFee + this.getMedicineCost() + this.getServiceCost();
  }

  /**
   * Kiểm tra có thuốc nào được kê không
   */
  hasMedicines(): boolean {
    return this.selectedMedicines && this.selectedMedicines.length > 0;
  }

  /**
   * Xử lý thay đổi tùy chọn mua thuốc
   */
  onMedicinePurchaseOptionChange(event: any) {
    const selectedOption = event.target.value;
    console.log('Medicine purchase option changed to:', selectedOption);
    // Có thể thêm logic xử lý tùy chọn mua thuốc ở đây
  }

  /**
   * Test MoMo payment (for debugging)
   */
  testMoMoPayment() {
    console.log('Testing MoMo payment...');
    this.processMoMoPayment();
  }
} 
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { BookingService } from 'src/app/services/booking.service';
import { MedicineService } from 'src/app/services/medician.service';
import { MedicalServiceService } from 'src/app/services/medical-service.service';
import { HistoryService } from 'src/app/services/history.service';
import { ExaminationService } from 'src/app/services/examination.service';
import { ServiceRequestService, ServiceRequestModel,ServiceRequestDTO } from 'src/app/services/service-request.service';

import { Booking } from 'src/app/models/booking';
import { Medicine } from 'src/app/models/medicine';
import { ExaminationStartDTO, ExaminationCompletionDTO, MedicineData, ServiceData } from 'src/app/models/examination.dto';

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
  currentBooking!: Booking;

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
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Get booking ID from route params
    this.route.params.subscribe(params => {
      this.bookingId = +params['id'];
      console.log('Booking ID from route:', this.bookingId);
    });

    this.initializeForms();
    this.loadBookingData();
    this.loadMasterData();
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
      notes: ['']
    });
  }

  loadBookingData() {
    // Include AWAITING_RESULTS in possible statuses for examination
    const possibleStatuses = ['ACCEPTING', 'IN_PROGRESS', 'AWAITING_RESULTS'];
    
    // Try to find booking in any of these statuses
    const requests = possibleStatuses.map(status => 
      this.bookingService.getAllBooking(status, null, null, null, null)
    );
    
    forkJoin(requests).subscribe((results: Booking[][]) => {
      // Flatten all results and find our booking
      const allBookings = results.flat();
      this.currentBooking = allBookings.find((b: Booking) => b.id === this.bookingId)!;
      
      if (this.currentBooking) {
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
            console.log('Starting from EXAMINATION step for booking status:', this.currentBooking.status);
            
            // Pre-fill examination form based on booking status
            if (this.currentBooking.status === 'ACCEPTING') {
              this.examinationForm.patchValue({
                symptoms: '',  // Leave empty for doctor to fill
                doctorNotes: '', // Leave empty for doctor to fill
                roomNumber: 'P001'
              });
            } else if (this.currentBooking.status === 'IN_PROGRESS') {
              // Even for IN_PROGRESS, start from EXAMINATION but with some pre-filled data
              this.examinationForm.patchValue({
                symptoms: '',  // Let doctor fill in symptoms
                doctorNotes: '', // Let doctor fill in notes
                roomNumber: 'P001'
              });
            } else if (this.currentBooking.status === 'AWAITING_RESULTS') {
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
        console.error('Booking not found with ID:', this.bookingId);
        this.toastr.error('Không tìm thấy thông tin lịch khám!', 'Lỗi');
        this.router.navigate(['/doctor/booking']);
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
      next: () => {
        this.currentBooking.status = 'IN_PROGRESS';
        this.currentStep = 'SERVICES';
        console.log('Successfully updated to IN_PROGRESS, moved to SERVICES step');
      },
      error: (err: any) => {
        console.error('Error updating booking to IN_PROGRESS:', err);
        this.toastr.error('Có lỗi khi cập nhật trạng thái: ' + err.message, 'Lỗi');
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
          id: 0,
          serviceId: service.id,
          serviceName: service.name,
          serviceType: 'MEDICAL_SERVICE',
          status: 'REQUESTED',
          cost: service.money,
          requestNotes: formData.notes,
          requestedAt: new Date()
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
        console.log('Starting examination...');
        this.startExamination();
        break;
      case 'SERVICES':
        console.log('Processing services, selectedServices.length:', this.selectedServices.length);
        console.log('Selected services:', this.selectedServices);
        
        // Chỉ gọi API nếu có ít nhất một service được chọn
        if (this.selectedServices.length > 0) {
          const serviceRequestDTOs: ServiceRequestDTO[] = this.selectedServices.map(service => ({
            serviceId: service.serviceId,
            requestNotes: service.requestNotes,
            resultNotes: service.resultNotes,
            cost: service.cost
          }));
          console.log('Service request DTOs:', serviceRequestDTOs);
          this.serviceRequestService.createServiceRequest(this.bookingId, serviceRequestDTOs).subscribe({
            next: () => {
              console.log('Services created successfully');
            },
            error: (err: any) => {
              console.error('Error creating services:', err);
            }
          });
        }
        
        // If services were requested, move to awaiting results
        if (this.selectedServices.length > 0) {
          this.moveToAwaitingResults();
        } else {
          console.log('No services requested, moving to prescription...');
          this.currentStep = 'PRESCRIPTION';
        }
        break;
      case 'PRESCRIPTION':
        console.log('Moving to payment...');
        this.currentStep = 'PAYMENT';
        break;
      case 'PAYMENT':
        console.log('Completing examination...');
        this.completeExamination();
        break;
    }
  }

  // Move booking to awaiting results status for lab tests/services
  moveToAwaitingResults() {
    this.bookingService.updateBooking(this.bookingId, 'AWAITING_RESULTS').subscribe({
      next: () => {
        this.toastr.success('Đã chỉ định dịch vụ/xét nghiệm. Bệnh nhân sẽ thực hiện và quay lại để tiếp tục khám.', 'Thành công');
        this.router.navigate(['/doctor/booking']);
      },
      error: (err: any) => {
        console.error('Error updating booking status:', err);
        this.toastr.error('Có lỗi khi cập nhật trạng thái', 'Lỗi');
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
        serviceId: item.serviceId,
        cost: item.cost,
        requestNotes: item.requestNotes || ''
      }));

      // Create completion DTO
      const completionData: ExaminationCompletionDTO = {
        bookingId: this.bookingId,
        medicines: medicineData,
        services: serviceData,
        totalAmount: this.totalCost,
        paymentMethod: this.paymentForm.value.paymentMethod || 'CASH',
        notes: this.examinationForm.value.doctorNotes + ' | ' + (this.paymentForm.value.notes || '')
      };

      this.examinationService.completeExamination(completionData).subscribe({
        next: () => {
          this.toastr.success('Khám bệnh hoàn tất!', 'Thành công');
          this.router.navigate(['/doctor/booking']);
        },
        error: (err: any) => {
          console.error('Error completing examination:', err);
          this.toastr.error('Có lỗi xảy ra khi hoàn thành khám bệnh: ' + err.error?.message, 'Lỗi');
        }
      });
    }
  }

  calculateTotalCost() {
    const medicineCost = this.selectedMedicines.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceCost = this.selectedServices.reduce((sum, item) => sum + item.cost, 0);
    this.totalCost = this.consultationFee + medicineCost + serviceCost;
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
      this.router.navigate(['/doctor/booking']);
    }
  }
} 
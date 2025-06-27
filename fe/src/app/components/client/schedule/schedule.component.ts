import { DatePipe, formatDate } from '@angular/common';
import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from 'src/app/services/toast.service';
import { Observable, map, of, forkJoin, catchError, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { Doctor } from 'src/app/models/doctor';
import { Hour } from 'src/app/models/hour';
import { Major } from 'src/app/models/major';
import { Schedule, Schedules, schedules, TimeSlot, DoctorScheduleHour } from 'src/app/models/schedule';
import { BookingService } from 'src/app/services/booking.service';
import { DoctorService } from 'src/app/services/doctor.service';
import { HourService } from 'src/app/services/hour.service';
import { MajorService } from 'src/app/services/major.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { storageUtils } from 'src/app/utils/storage';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent {
  @Input() ok = false;
  @Input() ktra : boolean = false;
  
  // Booking mode: 'BY_DOCTOR' hoặc 'BY_DATE'
  bookingMode: 'BY_DOCTOR' | 'BY_DATE' = 'BY_DOCTOR';
  
  // Available slots cho mode BY_DATE
  availableSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  loadingSlots: boolean = false;
  slotsError: string | null = null;
  
  // BY_DATE mode enhancements
  majorAvailableDates: string[] = []; // Ngày có bác sĩ của major nhận booking
  majorAvailableDatesAsDate: Date[] = []; // Date objects cho date picker filter
  selectedSession: 'MORNING' | 'AFTERNOON' | 'EVENING' | null = null;
  sessionSlots: { [key: string]: TimeSlot[] } = {}; // Slots theo ca
  showSessionModal: boolean = false;
  showSlotsPopup: boolean = false;
  // Thêm property để lưu trữ sessions có sẵn
  availableSessions: ('MORNING' | 'AFTERNOON' | 'EVENING')[] = [];
  
  //ngayban : Ngày mà bác sĩ có lịch trùng
  ngayban : Schedules[] = []
  disableDate : Date[] = [];
  // Thêm property để lưu danh sách ngày bác sĩ có lịch
  doctorAvailableDates: string[] = [];
  doctorAvailableDatesAsDate: Date[] = [];
  selectedTime: string | null = null;
  submited=false;
  listMajor!:Observable<Major[]>;
  listDoctor!:Observable<Doctor[]>;
  listHour!:Observable<Hour[]>;
  listHourTrung : number[] = [];
  profileInfor = storageUtils.get('profile');
  minDate: Date = new Date();

  addForm!: FormGroup;

  constructor(private formbuilder : FormBuilder,private majorsv: MajorService,
    private doctorsv : DoctorService, private schesv : ScheduleService,private bookingsv : BookingService,
        private hoursv : HourService, private toastr: ToastrService, private toastService: ToastService,
        private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef){};

  ngOnInit() {
    this.addForm = this.formbuilder.group({
      name:['',Validators.compose([Validators.minLength(6),Validators.required])],
      dob: ['',Validators.required],
      phone: ['',Validators.compose([Validators.minLength(9),Validators.maxLength(12),Validators.required])],
      email: ['',Validators.compose([Validators.email,Validators.required])],
      gender: ['MALE',Validators.required],
      address: ['',Validators.required],
      idMajor: ['',Validators.required],
      idUser: ['',Validators.required],
      date: ['',Validators.required],
      idHour: ['',Validators.required],
      note: ['',Validators.required]
    })

    this.listMajor = this.majorsv.getAllMajors();
    this.listMajor.subscribe({
      next(value) {
          console.log('lay data ok nha')
      },
      error(err) {
          console.log('Đã lỗi khi gọi data')
      },
    })

    // Auto-fill personal information for any logged-in user
    if (this.profileInfor) {
      this.autoFillClientInfo();
      console.log('Auto-filled user information:', this.profileInfor.fullName);
    }

    // Check for query parameters to pre-select doctor
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['doctorId'] && params['mode']) {
        console.log('Query params detected:', params);
        
        // Set booking mode
        this.setBookingMode(params['mode']);
        
        // Pre-select doctor if mode is BY_DOCTOR
        if (params['mode'] === 'BY_DOCTOR') {
          const doctorId = +params['doctorId'];
          
          // Wait a bit for component to initialize completely
          setTimeout(() => {
            this.preSelectDoctor(doctorId);
            
            // Re-fill user info after pre-selection (in case it gets overwritten)
            if (this.profileInfor) {
              setTimeout(() => {
                this.autoFillClientInfo();
              }, 300);
            }
          }, 100);
        }
      }
    });
  }

  get f() {
    return this.addForm.controls;
  }

  // Thay đổi booking mode
  setBookingMode(mode: 'BY_DOCTOR' | 'BY_DATE') {
    this.bookingMode = mode;
    
    // Reset tất cả fields liên quan bao gồm cả chuyên khoa
    this.addForm.patchValue({
      idMajor: '',
      idUser: '',
      idHour: '',
      date: ''
    });
    
    // Clear tất cả data và state cho cả 2 mode
    this.listDoctor = of([]);
    this.listHour = of([]);
    this.availableSlots = [];
    this.selectedSlot = null;
    this.loadingSlots = false;
    this.slotsError = null;
    this.listHourTrung = [];
    this.ngayban = [];
    this.disableDate = [];
    this.doctorAvailableDates = [];
    this.doctorAvailableDatesAsDate = [];
    
    // Clear BY_DATE specific data
    this.majorAvailableDates = [];
    this.majorAvailableDatesAsDate = [];
    this.availableSessions = [];
    this.sessionSlots = {};
    this.selectedSession = null;
    this.showSessionModal = false;
    this.showSlotsPopup = false;
    
    // Update validators tùy theo mode
    if (mode === 'BY_DOCTOR') {
      // Bác sĩ bắt buộc cho mode BY_DOCTOR
      this.addForm.get('idUser')?.setValidators([Validators.required]);
      this.addForm.get('idHour')?.setValidators([Validators.required]);
    } else {
      // Bác sĩ không bắt buộc cho mode BY_DATE, nhưng idHour vẫn bắt buộc
      this.addForm.get('idUser')?.clearValidators();
      this.addForm.get('idHour')?.setValidators([Validators.required]);
    }
    
    this.addForm.get('idUser')?.updateValueAndValidity();
    this.addForm.get('idHour')?.updateValueAndValidity();
  }

  // Load available slots khi đặt theo ngày - Sử dụng API mới được tối ưu hóa
  loadAvailableSlotsByDate() {
    const selectedDate = this.addForm.get('date')?.value;
    const majorId = this.addForm.get('idMajor')?.value;
    
    if (!selectedDate || !majorId) {
      this.availableSlots = [];
      this.loadingSlots = false;
      this.slotsError = null;
      return;
    }

    this.loadingSlots = true;
    this.slotsError = null;
    this.availableSlots = [];
    this.selectedSlot = null;

    const isoString: string = formatDate(selectedDate, 'dd/MM/yyyy', 'en-US');
    
    // Sử dụng API getAvailableSlotsByMajorAndDate cho BY_DATE booking
    this.schesv.getAvailableSlotsByMajorAndDate(majorId, isoString).pipe(
      catchError(error => {
        console.error('Error loading available slots by major and date:', error);
        this.slotsError = 'Không thể tải lịch trống theo chuyên khoa';
        return of([]);
      }),
      finalize(() => {
        this.loadingSlots = false;
      })
    ).subscribe({
      next: (slots) => {
        if (slots.length === 0) {
          this.slotsError = 'Không có lịch trống trong ngày này';
          return;
        }

        // Convert API response to TimeSlot format
        this.availableSlots = slots.map(slot => ({
          hourId: slot.hourId,
          hourName: slot.hourName,
          doctorId: slot.doctorId,
          doctorName: slot.doctorName,
          session: slot.session,
          doctorRank: slot.doctorRankId ? {
            id: slot.doctorRankId,
            name: slot.doctorRankName,
            code: slot.doctorRankCode,
            basePrice: slot.doctorRankBasePrice,
            description: slot.doctorRankDescription
          } : undefined
        }));

        // Sắp xếp slots theo giờ, sau đó theo tên bác sĩ
        this.availableSlots.sort((a, b) => {
          if (a.hourId !== b.hourId) {
            return a.hourId - b.hourId;
          }
          return a.doctorName.localeCompare(b.doctorName);
        });

        // Phân loại slots theo ca và kiểm tra sessions có sẵn
        this.sessionSlots = this.categorizeSlotsBySession(this.availableSlots);
        this.availableSessions = this.checkAvailableSessions(this.availableSlots);

        console.log('Available slots loaded:', this.availableSlots.length);
        console.log('Available sessions:', this.availableSessions);
      },
      error: (err) => {
        console.error('Error in loadAvailableSlotsByDate:', err);
        this.slotsError = 'Có lỗi xảy ra khi tải dữ liệu';
      }
    });
  }

  // Select time slot khi đặt theo ngày với validation
  selectTimeSlot(slot: TimeSlot) {
    // Kiểm tra availability trước khi select
    const selectedDate = this.addForm.get('date')?.value;
    const isoString: string = formatDate(selectedDate, 'dd/MM/yyyy', 'en-US');
    
    this.schesv.checkSlotAvailability(slot.doctorId, slot.hourId, isoString).subscribe({
      next: (isAvailable) => {
        if (isAvailable) {
          this.selectedSlot = slot;
          this.addForm.patchValue({
            idUser: slot.doctorId,
            idHour: slot.hourId
          });
          
          // Clear any previous errors
          this.slotsError = null;
          console.log('Slot selected successfully:', slot);
        } else {
          this.slotsError = 'Slot này đã không còn khả dụng. Vui lòng chọn slot khác.';
          // Refresh available slots
          this.loadAvailableSlotsByDate();
        }
      },
      error: (err) => {
        console.error('Error checking slot availability:', err);
        // Fallback - vẫn cho phép select nhưng cảnh báo
        this.selectedSlot = slot;
        this.addForm.patchValue({
          idUser: slot.doctorId,
          idHour: slot.hourId
        });
        this.slotsError = 'Không thể kiểm tra tính khả dụng của slot. Vui lòng thử lại.';
      }
    });
  }

  onsb() {
    this.submited = true;
    
    // Custom validation cho mode BY_DATE
    if (this.bookingMode === 'BY_DATE') {
      if (!this.selectedSlot) {
        this.toastService.showWarning('Vui lòng chọn một khung giờ khám');
        return;
      }
      
      // Đảm bảo idUser và idHour được set từ selectedSlot
      if (!this.addForm.get('idUser')?.value || !this.addForm.get('idHour')?.value) {
        this.toastService.showWarning('Có lỗi với thông tin bác sĩ hoặc giờ khám. Vui lòng chọn lại.');
        return;
      }
    }
    
    // Validation cho mode BY_DOCTOR
    if (this.bookingMode === 'BY_DOCTOR') {
      if (!this.addForm.get('idUser')?.value) {
        this.toastService.showWarning('Vui lòng chọn bác sĩ');
        return;
      }
      
      if (!this.addForm.get('idHour')?.value) {
        this.toastService.showWarning('Vui lòng chọn giờ khám');
        return;
      }
    }
    
    if(this.addForm.valid) {
      const {name,dob,phone,email,gender,address,idMajor,idUser,date,idHour,note} = this.addForm.value;
      const isoString: string = formatDate(date, 'dd/MM/yyyy', 'en-US');
      // dob ở backend là LocalDateTime nên cần chuyển sang Date
      const x = confirm('Bạn có đồng ý đăng lý lịch khám với những thông tin vừa nhập không?')
            if(x==true) {
                this.bookingsv.createBooking(name,new Date(dob),phone,email,gender,address,idMajor,idUser,isoString,idHour,note).subscribe({
                    next : (value) => {
                      // Reset form và trạng thái
                      this.submited = false;
                      this.resetFormAfterSubmit();
                      if(storageUtils.get('roleId')==3){
                        this.toastService.showSuccess('Đặt lịch thành công!');
                      }else{
                        this.toastService.showSuccess('Đặt lịch thành công! Hãy chờ đợi lịch được duyệt');
                      }
                    },
                    error: (err) => {
                        console.error('Đã có lỗi xảy ra khi tạo booking: ', err);
                        this.toastService.showError('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
                        this.submited = false;
                    }
                  })
            }
    }
  }

  onselectkhoa() {
    // Reset các field liên quan
    this.addForm.patchValue({
      idUser: '',
      idHour: ''
    });
    
    const id = this.addForm?.get('idMajor')?.value;
    
    if (!id) {
      // Nếu không chọn khoa, clear tất cả
      this.listDoctor = of([]);
      this.listHour = of([]);
      this.availableSlots = [];
      this.selectedSlot = null;
      this.listHourTrung = [];
      this.ngayban = [];
      this.disableDate = [];
      this.doctorAvailableDates = [];
      this.doctorAvailableDatesAsDate = [];
      
      // Clear BY_DATE specific data
      this.majorAvailableDates = [];
      this.majorAvailableDatesAsDate = [];
      this.selectedSession = null;
      this.sessionSlots = {};
      this.showSessionModal = false;
      this.showSlotsPopup = false;
      return;
    }
    
    if (this.bookingMode === 'BY_DOCTOR') {
      // Load doctors cho mode BY_DOCTOR
      this.listDoctor = this.doctorsv.getAllDoctorByMajor(null,'true',id,'');
      this.listDoctor.subscribe({
        next: (value) => {
          console.log('Loaded doctors for BY_DOCTOR mode:', value.length);
        },
        error: (err) => {
          console.error('Error loading doctors:', err);
        }
      });
      
      // Clear other data
      this.listHour = of([]);
      this.listHourTrung = [];
      this.ngayban = [];
      this.disableDate = [];
      this.doctorAvailableDates = [];
      this.doctorAvailableDatesAsDate = [];
    } else {
      // BY_DATE mode - load major available dates
      this.listDoctor = of([]);
      this.listHour = of([]);
      this.listHourTrung = [];
      this.ngayban = [];
      this.disableDate = [];
      this.doctorAvailableDates = [];
      this.doctorAvailableDatesAsDate = [];
      
      // Load available dates for the major
      this.loadMajorAvailableDates(id);
      
      // Reset BY_DATE specific state
      this.selectedSession = null;
      this.sessionSlots = {};
      this.showSessionModal = false;
      this.showSlotsPopup = false;
    }
    
    // Clear slots cho cả 2 mode
    this.availableSlots = [];
    this.selectedSlot = null;
    this.slotsError = null;
    this.loadingSlots = false;
  }

  onselectDoctor() {
    this.ngayban = []
    this.disableDate = []
    this.listHour = of([])
    this.listHourTrung = []
    // Reset available dates
    this.doctorAvailableDates = []
    this.doctorAvailableDatesAsDate = []
    
    const id = this.addForm?.get('idUser')?.value;
    
    if (!id) {
      return;
    }
    
    // Load danh sách ngày bác sĩ có lịch trước
    this.schesv.getDoctorAvailableDates(id.toString()).subscribe({
      next: (availableDates) => {
        this.doctorAvailableDates = availableDates;
        
        // Convert string dates to Date objects cho date picker filter
        this.doctorAvailableDatesAsDate = availableDates.map(dateStr => {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          return new Date(dateStr);
        });
        
        console.log('Doctor available dates loaded:', this.doctorAvailableDates.length);
        
        // Load chi tiết lịch làm việc của bác sĩ
        // this.loadDoctorDetailedSchedules(id.toString());
      },
      error: (err) => {
        console.error('Error loading doctor available dates:', err);
        // Fallback: load detailed schedules anyway
        // this.loadDoctorDetailedSchedules(id.toString());
      }
    });
  }

  // Helper method để load chi tiết lịch làm việc
  private loadDoctorDetailedSchedules(doctorId: string) {
    this.schesv.getAllScheduleByIdDoctor(doctorId).subscribe({
      next : (value) => {
          this.ngayban = value; // Lưu tất cả lịch làm việc của bác sĩ
          
          console.log('Doctor detailed schedules loaded:', value.length);
          
          // Nếu đã chọn ngày, load giờ làm việc cho ngày đó
          if (this.addForm.get('date')?.value) {
            this.loadAvailableHoursForSelectedDate();
          }
      },
      error: (err) => {
          console.error('Error loading doctor detailed schedules:', err);
      }
    });
  }

  uncheckRadio() {
    this.selectedTime = null;
  }

  // Pre-select doctor when coming from doctor listing page
  preSelectDoctor(doctorId: number) {
    console.log('Trying to pre-select doctor with ID:', doctorId);
    
    // First get the doctor info to find their major
    this.doctorsv.getDoctorById(doctorId.toString()).subscribe({
      next: (doctor: any) => {
        console.log('Doctor data received:', doctor);
        
        if (doctor && doctor.major && doctor.major.id) {
          const majorId = doctor.major.id;
          
          // Set the major first
          this.addForm.patchValue({
            idMajor: majorId
          });
          
          console.log('Major ID set to:', majorId);
          
          // Load doctors for this major manually
          this.listDoctor = this.doctorsv.getAllDoctorByMajor(null,'true', majorId,'');
          this.listDoctor.subscribe({
            next: (doctors) => {
              console.log('Doctors loaded:', doctors.length);
              console.log('Current form values before setting doctor:', this.addForm.value);
              
              // Now select the specific doctor
              this.addForm.patchValue({
                idUser: doctorId
              });
              
              console.log('Doctor ID set to:', doctorId);
              console.log('Current form values after setting doctor:', this.addForm.value);
              
              // Trigger change detection to update UI
              this.cdr.detectChanges();
              
              // Load schedule for this doctor
              setTimeout(() => {
                this.onselectDoctor();
              }, 200);
            },
            error: (err) => {
              console.error('Error loading doctors for major:', err);
            }
          });
          
        } else {
          console.error('Doctor data structure invalid:', doctor);
          this.toastService.showError('Thông tin bác sĩ không hợp lệ');
        }
      },
      error: (err) => {
        console.error('Error loading doctor info for pre-selection:', err);
        this.toastService.showError('Không thể tải thông tin bác sĩ');
      }
    });
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.listHourTrung = [];
    
    if (this.bookingMode === 'BY_DOCTOR') {
      // Logic mới cho mode BY_DOCTOR - chỉ load giờ mà bác sĩ làm việc
      const doctorId = this.addForm.get('idUser')?.value;
      
      if (!doctorId) {
        this.listHour = of([]);
        console.log('No doctor selected, clearing hours');
        return;
      }
      
      // Sử dụng method mới để load chỉ giờ làm việc của bác sĩ
      this.loadAvailableHoursForSelectedDate();
    } else {
      // Logic cho mode BY_DATE
      this.availableSlots = [];
      this.selectedSlot = null;
      this.slotsError = null;
      this.addForm.patchValue({
        idUser: '',
        idHour: ''
      });
      
      // Load available slots cho ngày được chọn (với delay nhỏ để tránh gọi API liên tục)
      setTimeout(() => {
        this.loadAvailableSlotsByDate();
      }, 300);
    }
  }

  myFilter = (d: Date | null): boolean => {
    const selectedDate = d || new Date();
    
    if (this.bookingMode === 'BY_DOCTOR') {
      // Chỉ áp dụng filter cho mode BY_DOCTOR
      // Kiểm tra xem ngày này có trong danh sách ngày bác sĩ có lịch không
      return this.doctorAvailableDatesAsDate.some(availableDate =>
        this.isSameDate(selectedDate, availableDate)
      );
    } else {
      // BY_DATE mode - kiểm tra ngày có bác sĩ của major này không
      return this.majorAvailableDatesAsDate.some(availableDate =>
        this.isSameDate(selectedDate, availableDate)
      );
    }
  };

  isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Load giờ làm việc available cho ngày đã chọn (mode BY_DOCTOR)
  loadAvailableHoursForSelectedDate() {
    const selectedDate = this.addForm.get('date')?.value;
    const doctorId = this.addForm.get('idUser')?.value;
    
    if (!selectedDate || !doctorId) {
      this.listHour = of([]);
      this.listHourTrung = [];
      return;
    }

    const isoString: string = formatDate(selectedDate, 'dd/MM/yyyy', 'en-US');
    console.log('Loading working hours for doctor:', doctorId, 'on date:', isoString);
    
    // Gọi API để lấy ca làm việc của bác sĩ cho ngày cụ thể
    forkJoin({
      workingHours: this.schesv.getDoctorWorkingHoursForDate(doctorId.toString(), isoString),
      existingBookings: this.bookingsv.getAllBooking('ACCEPTING', doctorId.toString(), isoString, isoString, null)
    }).subscribe({
      next: ({ workingHours, existingBookings }) => {
        console.log('=== DEBUG INFO ===');
        console.log('Raw workingHours:', workingHours);
        console.log('Raw existingBookings:', existingBookings);
        
        if (workingHours.length === 0) {
          // Bác sĩ không làm việc ngày này
          this.listHour = of([]);
          this.listHourTrung = [];
          console.log('Doctor does not work on this date');
          return;
        }
        
        // Lấy các giờ đã được book
        this.listHourTrung = existingBookings.map(booking => booking.idHour);
        
        console.log('Mapped listHourTrung (booked hours):', this.listHourTrung);
        console.log('Working hours structure check:');
        workingHours.forEach((schedule, index) => {
          console.log(`Schedule ${index}:`, {
            id: schedule.id,
            idHour: schedule.idHour,
            hourName: schedule.hourName,
            isBooked: this.listHourTrung.includes(schedule.idHour)
          });
        });
        
        // Convert DoctorScheduleHour[] to Hour[] for dropdown
        const hoursForDropdown: Hour[] = workingHours.map(schedule => ({
          id: schedule.idHour,
          name: schedule.hourName || `Giờ ${schedule.idHour}`,
          session: schedule.idHour <= 4 ? 'Sáng' : 'Chiều',
          startTime: schedule.hourName?.split(' - ')[0] || '',
          endTime: schedule.hourName?.split(' - ')[1] || ''
        }));
        
        // Set list hours available từ API response
        this.listHour = of(hoursForDropdown);
        
        // Verify listHour after assignment
        this.listHour.subscribe(hours => {
          console.log('ListHour after assignment:', hours);
          console.log('Available hours (not booked):', 
            hours.filter(hour => !this.listHourTrung.includes(hour.id))
          );
        });
        
        console.log('API - Working hours for selected date:', workingHours.length);
        console.log('API - Booked hours:', this.listHourTrung.length);
        console.log('API - Working hours data:', workingHours);
        console.log('=== END DEBUG ===');
      },
      error: (err) => {
        console.error('Error loading available hours from API:', err);
        
        // Fallback về logic cũ nếu API mới chưa có
        console.log('Falling back to local data...');
        this.loadAvailableHoursFromLocalData(isoString, doctorId);
      }
    });
  }

  // Fallback method sử dụng dữ liệu cục bộ
  private loadAvailableHoursFromLocalData(isoString: string, doctorId: any) {
    // Lấy lịch làm việc của bác sĩ trong ngày đã chọn từ dữ liệu đã load
    const doctorSchedulesForDate = this.ngayban.filter(schedule => 
      schedule.date === isoString
    );
    
    if (doctorSchedulesForDate.length === 0) {
      // Bác sĩ không làm việc ngày này
      this.listHour = of([]);
      this.listHourTrung = [];
      console.log('Fallback - Doctor does not work on this date');
      return;
    }
    
    // Lấy các giờ mà bác sĩ làm việc
    const workingHourIds = doctorSchedulesForDate.map(schedule => schedule.idHour);
    
    // Load tất cả hours và filter chỉ những giờ bác sĩ làm việc
    forkJoin({
      allHours: this.hoursv.getAllHour(),
      existingBookings: this.bookingsv.getAllBooking('ACCEPTING', doctorId.toString(), isoString, isoString, null)
    }).subscribe({
      next: ({ allHours, existingBookings }) => {
        // Lọc chỉ những giờ bác sĩ có lịch làm việc
        const doctorWorkingHours = allHours.filter(hour => 
          workingHourIds.includes(hour.id)
        );
        
        // Lấy các giờ đã được book
        this.listHourTrung = existingBookings.map(booking => booking.idHour);
        
        // Set list hours available (doctorWorkingHours is already Hour[])
        this.listHour = of(doctorWorkingHours);
        
        console.log('Fallback - Working hours for selected date:', doctorWorkingHours.length);
        console.log('Fallback - Booked hours:', this.listHourTrung.length);
      },
      error: (err) => {
        console.error('Error in fallback method:', err);
        this.listHour = of([]);
        this.listHourTrung = [];
      }
    });
  }

  // TrackBy function để tối ưu hóa rendering của slots
  trackBySlot(index: number, slot: TimeSlot): string {
    return `${slot.hourId}_${slot.doctorId}`;
  }

  // Helper methods cho BY_DATE mode
  
  // Phân chia slots theo ca (sáng/chiều/tối)
  categorizeSlotsBySession(slots: TimeSlot[]): { [key: string]: TimeSlot[] } {
    const sessions = {
      MORNING: [] as TimeSlot[],
      AFTERNOON: [] as TimeSlot[],
      EVENING: [] as TimeSlot[]
    };

    slots.forEach(slot => {
      // Sử dụng trường session từ TimeSlot thay vì dựa vào hourId
      if (slot.session === 'MORNING') {
        sessions.MORNING.push(slot);
      } else if (slot.session === 'AFTERNOON') {
        sessions.AFTERNOON.push(slot);
      } else if (slot.session === 'EVENING') {
        sessions.EVENING.push(slot);
      }
    });

    return sessions;
  }

  // Kiểm tra session nào có TimeSlot
  checkAvailableSessions(slots: TimeSlot[]): ('MORNING' | 'AFTERNOON' | 'EVENING')[] {
    const sessionMap = this.categorizeSlotsBySession(slots);
    const availableSessions: ('MORNING' | 'AFTERNOON' | 'EVENING')[] = [];
    
    if (sessionMap['MORNING'].length > 0) {
      availableSessions.push('MORNING');
    }
    if (sessionMap['AFTERNOON'].length > 0) {
      availableSessions.push('AFTERNOON');
    }
    if (sessionMap['EVENING'].length > 0) {
      availableSessions.push('EVENING');
    }
    
    return availableSessions;
  }

  // Lấy tên ca bằng tiếng Việt
  getSessionName(session: string): string {
    switch (session) {
      case 'MORNING': return 'Ca sáng (7h - 11h)';
      case 'AFTERNOON': return 'Ca chiều (13h - 15h)';
      case 'EVENING': return 'Ca tối (15h - 17h)';
      default: return '';
    }
  }

  // Load available dates cho major trong BY_DATE mode
  loadMajorAvailableDates(majorId: number) {
    this.schesv.getAvailableDayByMajor(majorId).pipe(
      catchError(error => {
        console.error('Error loading major available dates:', error);
        return of([]);
      })
    ).subscribe({
      next: (localDates: string[]) => {
        // API trả về List<LocalDate> as string array (format: YYYY-MM-DD)
        this.majorAvailableDates = localDates.map(dateStr => {
          // Convert từ YYYY-MM-DD sang dd/MM/yyyy
          const date = new Date(dateStr);
          return formatDate(date, 'dd/MM/yyyy', 'en-US');
        });
        
        // Convert to Date objects cho date picker filter
        this.majorAvailableDatesAsDate = localDates.map(dateStr => {
          return new Date(dateStr); // LocalDate format YYYY-MM-DD
        });
        
        console.log('Major available dates loaded:', this.majorAvailableDates.length);
        console.log('Available dates:', this.majorAvailableDates);
      },
      error: (err) => {
        console.error('Error loading major available dates:', err);
        this.majorAvailableDates = [];
        this.majorAvailableDatesAsDate = [];
      }
    });
  }

  // Mở modal chọn ca
  openSessionModal() {
    if (!this.addForm.get('date')?.value || !this.addForm.get('idMajor')?.value) {
      this.toastService.showWarning('Vui lòng chọn chuyên khoa và ngày khám trước');
      return;
    }
    
    this.showSessionModal = true;
    this.selectedSession = null;
    this.sessionSlots = {};
  }

  // Chọn ca và load slots
  selectSession(session: 'MORNING' | 'AFTERNOON' | 'EVENING') {
    this.selectedSession = session;
    this.showSessionModal = false;
    
    // Load slots cho ca được chọn
    this.loadSlotsForSession(session);
  }

  // Load slots cho ca cụ thể
  loadSlotsForSession(session: 'MORNING' | 'AFTERNOON' | 'EVENING') {
    this.loadingSlots = true;
    this.slotsError = null;
    
    const selectedDate = this.addForm.get('date')?.value;
    const majorId = this.addForm.get('idMajor')?.value;
    const isoString: string = formatDate(selectedDate, 'dd/MM/yyyy', 'en-US');
    
    this.schesv.getAvailableSlotsByMajorAndDate(majorId, isoString).pipe(
      catchError(error => {
        console.error('Error loading slots for session:', error);
        this.slotsError = 'Không thể tải lịch trống cho ca này';
        return of([]);
      }),
      finalize(() => {
        this.loadingSlots = false;
      })
    ).subscribe({
      next: (slots) => {
        // Convert và categorize slots
        const allSlots = slots.map(slot => ({
          hourId: slot.hourId,
          hourName: slot.hourName,
          doctorId: slot.doctorId,
          doctorName: slot.doctorName,
          session: slot.session,
          doctorRank: slot.doctorRankId ? {
            id: slot.doctorRankId,
            name: slot.doctorRankName,
            code: slot.doctorRankCode,
            basePrice: slot.doctorRankBasePrice,
            description: slot.doctorRankDescription
          } : undefined
        }));

        this.sessionSlots = this.categorizeSlotsBySession(allSlots);
        
        // Lấy slots cho ca được chọn
        const sessionSlotList = this.sessionSlots[session] || [];
        
        if (sessionSlotList.length === 0) {
          this.slotsError = `Không có lịch trống cho ${this.getSessionName(session)}`;
          return;
        }

        // Sắp xếp slots
        sessionSlotList.sort((a, b) => {
          if (a.hourId !== b.hourId) {
            return a.hourId - b.hourId;
          }
          return a.doctorName.localeCompare(b.doctorName);
        });

        // Hiển thị popup với slots của ca được chọn
        this.availableSlots = sessionSlotList;
        this.showSlotsPopup = true;
        
        console.log(`${session} slots loaded:`, sessionSlotList.length);
      },
      error: (err) => {
        console.error('Error in loadSlotsForSession:', err);
        this.slotsError = 'Có lỗi xảy ra khi tải dữ liệu';
      }
    });
  }

  // Đóng popup slots
  closeSlotsPopup() {
    this.showSlotsPopup = false;
    this.selectedSession = null;
  }

  // Đóng modal chọn ca
  closeSessionModal() {
    this.showSessionModal = false;
    this.selectedSession = null;
  }

  // Reset form và state sau khi submit thành công
  resetFormAfterSubmit() {
    // Reset booking fields only
    this.addForm.patchValue({
      idMajor: '',
      idUser: '',
      date: '',
      idHour: '',
      note: ''
    });
    
    // If user is logged-in, keep personal information filled
    if (this.profileInfor) {
      // Don't reset personal fields, just re-fill them to ensure they stay
      setTimeout(() => {
        this.autoFillClientInfo();
      }, 100);
    } else {
      // Reset personal information for non-logged-in users
      this.addForm.patchValue({
        name: '',
        dob: '',
        phone: '',
        email: '',
        address: '',
        gender: 'MALE'
      });
    }
    
    // Reset tất cả state
    this.listDoctor = of([]);
    this.listHour = of([]);
    this.availableSlots = [];
    this.selectedSlot = null;
    this.loadingSlots = false;
    this.slotsError = null;
    this.listHourTrung = [];
    this.ngayban = [];
    this.disableDate = [];
    this.doctorAvailableDates = [];
    this.doctorAvailableDatesAsDate = [];
    
    // Reset về mode mặc định
    this.bookingMode = 'BY_DOCTOR';
    
    // Update validators về trạng thái mặc định
    this.addForm.get('idUser')?.setValidators([Validators.required]);
    this.addForm.get('idHour')?.setValidators([Validators.required]);
    this.addForm.get('idUser')?.updateValueAndValidity();
    this.addForm.get('idHour')?.updateValueAndValidity();
  }



  // Auto-fill user information for any logged-in user
  autoFillClientInfo() {
    if (!this.profileInfor) {
      console.log('No profile information available');
      return;
    }
    
    try {
      const dob = new Date(this.profileInfor.dob);
      const formattedDob = dob.toISOString().split('T')[0]; // "2003-06-28"
    
      this.addForm.patchValue({
        name: this.profileInfor.fullName || '',
        dob: formattedDob,
        phone: this.profileInfor.phone || '',
        email: this.profileInfor.gmail || '',
        address: this.profileInfor.address || '',
        gender: this.profileInfor.gender || 'MALE'
      });
      
      console.log('Auto-filled user information:', {
        name: this.profileInfor.fullName,
        email: this.profileInfor.gmail,
        phone: this.profileInfor.phone,
        roleId: this.profileInfor.roleId
      });
    } catch (error) {
      console.error('Error auto-filling user information:', error);
    }
  }


  

  // Format currency for Vietnamese display
  formatCurrency(price: number): string {
    if (!price) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}

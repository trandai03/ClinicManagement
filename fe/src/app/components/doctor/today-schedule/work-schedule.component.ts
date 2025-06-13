import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, forkJoin, map, catchError, of } from 'rxjs';
import { Hour } from 'src/app/models/hour';
import { ScheduleService } from 'src/app/services/schedule.service';
import { HourService } from 'src/app/services/hour.service';
import { storageUtils } from 'src/app/utils/storage';

// Interface cho doctor schedule (different from patient schedule)
interface DoctorSchedule {
  id: number;
  idUser: number;
  idHour: number;
  date: string;
  note?: string;
}

// Interface cho working schedule
interface WorkingSchedule {
  date: string;
  hours: ScheduleHour[];
  isFullDay: boolean;
  isUnavailable: boolean;
  note?: string;
}

interface ScheduleHour {
  hourId: number;
  hourName: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookingInfo?: any;
}

interface WeekView {
  startDate: Date;
  endDate: Date;
  days: DaySchedule[];
}

interface DaySchedule {
  date: Date;
  dateString: string;
  isToday: boolean;
  isWeekend: boolean;
  schedules: ScheduleHour[];
  isUnavailable: boolean;
  unavailableNote?: string;
}

@Component({
  selector: 'app-work-schedule',
  templateUrl: './work-schedule.component.html',
  styleUrls: ['./work-schedule.component.scss']
})
export class WorkScheduleComponent implements OnInit {
  // Current view mode
  viewMode: 'week' | 'month' = 'week';
  currentDate = new Date();
  currentWeek: WeekView | null = null;
  
  // Forms
  scheduleForm!: FormGroup;
  unavailableForm!: FormGroup;
  
  // Data
  allHours: Hour[] = [];
  mySchedules: DoctorSchedule[] = [];
  workingSchedules: WorkingSchedule[] = [];
  
  // Loading states
  loading = false;
  savingSchedule = false;
  
  // Modal states
  showScheduleModal = false;
  showUnavailableModal = false;
  selectedDate: string | null = null;
  
  // User info
  doctorId = storageUtils.get('userId');
  doctorInfo = storageUtils.get('profile');
  
  // Helper for template
  get todayString(): string {
    return new Date().toISOString().slice(0, 19);
  }
  
  // Helper method for minimum date in unavailable form
  getMinDateForUnavailable(): string {
    const fromDate = this.unavailableForm?.get('fromDate')?.value;
    return fromDate || this.todayString;
  }

  constructor(
    private scheduleService: ScheduleService,
    private hourService: HourService,
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadInitialData();
    this.generateCurrentWeek();
  }

  initForms() {
    this.scheduleForm = this.formBuilder.group({
      date: ['', Validators.required],
      selectedHours: [[], Validators.required],
      isFullDay: [false],
      note: ['']
    });

    this.unavailableForm = this.formBuilder.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', Validators.required],
      note: ['']
    });
  }

  loadInitialData() {
    this.loading = true;
    
    forkJoin({
      hours: this.hourService.getAllHour(),
      schedules: this.loadDoctorSchedules()
    }).pipe(
      catchError(error => {
        console.error('Error loading initial data:', error);
        return of({ hours: [], schedules: [] });
      })
    ).subscribe({
      next: ({ hours, schedules }) => {
        this.allHours = hours;
        this.mySchedules = schedules;
        this.generateWorkingSchedules();
        this.generateCurrentWeek();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error in loadInitialData:', error);
        this.loading = false;
      }
    });
  }

  loadDoctorSchedules(): Observable<DoctorSchedule[]> {
    // Get current month date range
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const fromDate = formatDate(startOfMonth, 'dd/MM/yyyy', 'en-US');
    const toDate = formatDate(endOfMonth, 'dd/MM/yyyy', 'en-US');
    
    return this.scheduleService.getDoctorSchedulesByDateRange(this.doctorId, fromDate, toDate).pipe(
      map((schedules: any[]) => {
        return schedules.map(s => ({
          id: s.id,
          idUser: s.idUser || s.idDoctor,
          idHour: s.idHour,
          date: s.date,
          note: s.note || ''
        }));
      }),
      catchError(error => {
        console.error('Error loading doctor schedules:', error);
        return of([]);
      })
    );
  }

  generateCurrentWeek() {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const days: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dateString = formatDate(date, 'dd/MM/yyyy', 'en-US');
      const isToday = this.isSameDate(date, new Date());
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Get schedules for this date
      const daySchedules = this.getSchedulesForDate(dateString);
      
      days.push({
        date,
        dateString,
        isToday,
        isWeekend,
        schedules: daySchedules,
        isUnavailable: false
      });
    }

    this.currentWeek = {
      startDate: startOfWeek,
      endDate: endOfWeek,
      days
    };
  }

  getSchedulesForDate(dateString: string): ScheduleHour[] {
    const schedules: ScheduleHour[] = [];
    
    this.allHours.forEach(hour => {
      const hasSchedule = this.mySchedules.some(
        schedule => schedule.date === dateString && schedule.idHour === hour.id
      );
      
      schedules.push({
        hourId: hour.id,
        hourName: hour.name,
        isAvailable: hasSchedule,
        isBooked: false // TODO: Check bookings
      });
    });
    
    return schedules;
  }

  generateWorkingSchedules() {
    // Process schedules data for display
    const scheduleMap = new Map<string, DoctorSchedule[]>();
    
    this.mySchedules.forEach(schedule => {
      if (!scheduleMap.has(schedule.date)) {
        scheduleMap.set(schedule.date, []);
      }
      scheduleMap.get(schedule.date)!.push(schedule);
    });

    this.workingSchedules = Array.from(scheduleMap.entries()).map(([date, schedules]) => ({
      date,
      hours: schedules.map(schedule => ({
        hourId: schedule.idHour,
        hourName: this.getHourName(schedule.idHour),
        isAvailable: true,
        isBooked: false
      })),
      isFullDay: schedules.length === this.allHours.length,
      isUnavailable: false
    }));
  }

  // Navigation methods
  previousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateCurrentWeek();
  }

  nextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateCurrentWeek();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCurrentWeek();
  }

  // Modal methods
  openScheduleModal(date?: string) {
    this.selectedDate = date || null;
    
    // If date is provided, convert it to proper format for input
    let inputDate = '';
    if (date) {
      const [day, month, year] = date.split('/');
      inputDate = `${year}-${month}-${day}`;
    }
    
    this.scheduleForm.patchValue({
      date: inputDate,
      selectedHours: [],
      isFullDay: false,
      note: ''
    });
    this.showScheduleModal = true;
  }

  openUnavailableModal() {
    this.unavailableForm.reset();
    this.showUnavailableModal = true;
  }

  closeModals() {
    this.showScheduleModal = false;
    this.showUnavailableModal = false;
    this.selectedDate = null;
  }

  // Schedule management
  onScheduleSubmit() {
    if (this.scheduleForm.invalid) return;

    this.savingSchedule = true;
    const formData = this.scheduleForm.value;
    
    // Convert date format
    const date = new Date(formData.date);
    const dateString = formatDate(date, 'dd/MM/yyyy', 'en-US');
    
    const scheduleData = {
      idUser: this.doctorId,
      date: dateString,
      hours: formData.isFullDay ? this.allHours.map(h => h.id) : formData.selectedHours,
      note: formData.note
    };

    // Call API to save schedule
    this.saveScheduleToAPI(scheduleData);
  }

  saveScheduleToAPI(scheduleData: any) {
    // First, remove existing schedules for this date
    this.deleteExistingSchedulesForDate(scheduleData.date).then(() => {
      // Create single schedule request with list of hours
      this.scheduleService.createSchedule(
        scheduleData.idUser, 
        scheduleData.hours, 
        scheduleData.date, 
        scheduleData.note || ''
      ).pipe(
        catchError(error => {
          console.error('Error saving schedule:', error);
          this.toastr.error('Có lỗi xảy ra khi lưu lịch làm việc! Vui lòng thử lại.');
          this.savingSchedule = false;
          return of(null);
        })
      ).subscribe({
        next: (result) => {
          if (result) {
            console.log('Schedule saved successfully:', result);
            
            // Reload data to get fresh schedules
            this.loadInitialData();
            this.closeModals();
            
            this.toastr.success('Đã lưu lịch làm việc thành công!');
          }
          this.savingSchedule = false;
        },
        error: (error) => {
          console.error('Error in schedule submission:', error);
          this.savingSchedule = false;
          this.toastr.error('Có lỗi xảy ra khi lưu lịch làm việc! Vui lòng thử lại.');
        }
      });
    });
  }

  private deleteExistingSchedulesForDate(date: string): Promise<void> {
    return new Promise((resolve) => {
      const schedulesToDelete = this.mySchedules.filter(schedule => schedule.date === date);
      
      if (schedulesToDelete.length === 0) {
        resolve();
        return;
      }

      const deleteCalls = schedulesToDelete.map(schedule => 
        this.scheduleService.deleteSchedule(schedule.id)
      );

      forkJoin(deleteCalls).pipe(
        catchError(error => {
          console.error('Error deleting existing schedules:', error);
          return of([]);
        })
      ).subscribe({
        next: () => {
          resolve();
        },
        error: () => {
          resolve(); // Continue even if delete fails
        }
      });
    });
  }

  onUnavailableSubmit() {
    if (this.unavailableForm.invalid) return;

    const formData = this.unavailableForm.value;
    
    // Convert dates to dd/MM/yyyy format
    const fromDate = formatDate(new Date(formData.fromDate), 'dd/MM/yyyy', 'en-US');
    const toDate = formatDate(new Date(formData.toDate), 'dd/MM/yyyy', 'en-US');
    
    // Call API to create unavailable period
    this.scheduleService.createUnavailablePeriod(
      this.doctorId, 
      fromDate, 
      toDate, 
      formData.reason, 
      formData.note || ''
    ).subscribe({
      next: (response) => {
        console.log('Unavailable period created successfully:', response);
        this.closeModals();
        this.toastr.success(`Đã báo bận từ ${fromDate} đến ${toDate}!`);
        
        // Reload data to reflect changes
        this.loadInitialData();
      },
      error: (error) => {
        console.error('Error creating unavailable period:', error);
        this.toastr.error('Có lỗi xảy ra khi báo bận! Vui lòng thử lại.');
      }
    });
  }

  deleteSchedule(date: string, hourId?: number) {
    const confirmDelete = confirm(
      hourId 
        ? 'Bạn có chắc muốn xóa giờ làm việc này?' 
        : 'Bạn có chắc muốn xóa toàn bộ lịch làm việc trong ngày này?'
    );
    
    if (confirmDelete) {
      const schedulesToDelete = hourId 
        ? this.mySchedules.filter(schedule => schedule.date === date && schedule.idHour === hourId)
        : this.mySchedules.filter(schedule => schedule.date === date);

      if (schedulesToDelete.length === 0) {
        this.toastr.warning('Không tìm thấy lịch để xóa!');
        return;
      }

      // Delete from API
      const deleteCalls = schedulesToDelete.map(schedule => 
        this.scheduleService.deleteSchedule(schedule.id)
      );

      forkJoin(deleteCalls).pipe(
        catchError(error => {
          console.error('Error deleting schedule:', error);
          this.toastr.error('Có lỗi xảy ra khi xóa lịch làm việc! Vui lòng thử lại.');
          return of([]);
        })
      ).subscribe({
        next: (results) => {
          console.log('Schedule deleted successfully:', results);
          
          // Reload data
          this.loadInitialData();
          
          this.toastr.success('Đã xóa lịch làm việc thành công!');
        },
        error: (error) => {
          console.error('Error in schedule deletion:', error);
          this.toastr.error('Có lỗi xảy ra khi xóa lịch làm việc! Vui lòng thử lại.');
        }
      });
    }
  }

  // Utility methods
  getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getHourName(hourId: number): string {
    const hour = this.allHours.find(h => h.id === hourId);
    return hour ? hour.name : '';
  }

  formatDateDisplay(date: Date): string {
    return formatDate(date, 'dd/MM/yyyy', 'en-US');
  }

  getDayName(date: Date): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  }

  // Toggle hour selection in form
  toggleHourSelection(hourId: number) {
    const currentSelection = this.scheduleForm.get('selectedHours')?.value || [];
    const index = currentSelection.indexOf(hourId);
    
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(hourId);
    }
    
    this.scheduleForm.patchValue({ selectedHours: currentSelection });
  }

  isHourSelected(hourId: number): boolean {
    const currentSelection = this.scheduleForm.get('selectedHours')?.value || [];
    return currentSelection.includes(hourId);
  }

  onFullDayToggle() {
    const isFullDay = this.scheduleForm.get('isFullDay')?.value;
    if (isFullDay) {
      this.scheduleForm.patchValue({
        selectedHours: this.allHours.map(h => h.id)
      });
    } else {
      this.scheduleForm.patchValue({
        selectedHours: []
      });
    }
  }

  // Get available hours count for a day
  getAvailableHoursCount(day: DaySchedule): number {
    return day.schedules.filter(s => s.isAvailable).length;
  }

  // Check if a day has any available hours
  hasAvailableHours(day: DaySchedule): boolean {
    return day.schedules.some(s => s.isAvailable);
  }
} 
setBookingMode(mode: 'BY_DOCTOR' | 'BY_DATE') {
  this.bookingMode = mode;
  
  // Lưu lại giá trị chuyên khoa hiện tại
  const currentMajorId = this.addForm.get('idMajor')?.value;
  
  // Reset các field tương ứng
  if (mode === 'BY_DOCTOR') {
    this.addForm.patchValue({
      idUser: '',
      idHour: ''
    });
    // Clear available slots
    this.availableSlots = [];
    this.selectedSlot = null;
    this.loadingSlots = false;
    this.slotsError = null;
    this.listHour = of([]);
    this.listHourTrung = [];
    
    // Clear BY_DATE specific data
    this.majorAvailableDates = [];
    this.majorAvailableDatesAsDate = [];
    this.availableSessions = [];
    this.sessionSlots = {};
    this.selectedSession = null;
    this.showSessionModal = false;
    this.showSlotsPopup = false;
    
    // Update validators - bác sĩ bắt buộc
    this.addForm.get('idUser')?.setValidators([Validators.required]);
    this.addForm.get('idHour')?.setValidators([Validators.required]);
    
  } else {
    this.addForm.patchValue({
      idUser: '',
      idHour: ''
    });
    
    // Update validators - bác sĩ không bắt buộc khi đặt theo ngày, nhưng idHour vẫn bắt buộc
    this.addForm.get('idUser')?.clearValidators();
    this.addForm.get('idHour')?.setValidators([Validators.required]);
    
    // Clear doctor-specific data
    this.listDoctor = of([]);
    this.listHour = of([]);
    this.listHourTrung = [];
    this.ngayban = [];
    this.disableDate = [];
    this.doctorAvailableDates = [];
    this.doctorAvailableDatesAsDate = [];
    
    // Clear available slots but keep session data structure
    this.availableSlots = [];
    this.selectedSlot = null;
    this.loadingSlots = false;
    this.slotsError = null;
    this.availableSessions = [];
    this.sessionSlots = {};
    this.selectedSession = null;
    this.showSessionModal = false;
    this.showSlotsPopup = false;
  }
  
  this.addForm.get('idUser')?.updateValueAndValidity();
  this.addForm.get('idHour')?.updateValueAndValidity();
  
  // Tự động load dữ liệu tương ứng nếu đã có chuyên khoa được chọn
  if (currentMajorId) {
    if (mode === 'BY_DOCTOR') {
      // Load danh sách bác sĩ cho mode BY_DOCTOR
      this.listDoctor = this.doctorsv.getAllDoctorByMajor(null,'true',currentMajorId,'');
      this.listDoctor.subscribe({
        next: (doctors) => {
          console.log('Auto-loaded doctors for BY_DOCTOR mode:', doctors.length);
        },
        error: (err) => {
          console.error('Error auto-loading doctors:', err);
        }
      });
    } else {
      // Load available dates cho mode BY_DATE
      this.loadMajorAvailableDates(currentMajorId);
      
      // Nếu cả ngày và khoa đều đã chọn, load available slots
      if (this.addForm.get('date')?.value) {
        this.loadAvailableSlotsByDate();
      }
    }
  }
} 
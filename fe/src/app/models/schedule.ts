export interface Schedule {
  id: number;
  idDoctor: number;
  weekday: string;
  session: string;
  date: string;
  note: string;
  patient: {
    id: number;
    gender: string;
    dob: string;
  };
}

// Interface phù hợp với backend ScheduleModel
export interface Schedules {
  id: number;
  date: string;
  idHour: number; // Thêm field này từ backend ScheduleModel
}

// Interface cho DoctorScheduleHourDTO từ backend
export interface DoctorScheduleHour {
  id: number;
  idUser: number;
  idHour: number;
  date: string;
  status: string; // AVAILABLE, UNAVAILABLE, BUSY
  note?: string;
  hourName?: string;
  doctorName?: string;
  doctorMajor?: string;
}

// Interface cho time slot khi đặt theo ngày (move từ component)
export interface TimeSlot {
  hourId: number;
  hourName: string;
  doctorId: number;
  doctorName: string;
  doctorRank?: {
    id: number;
    name: string;
    code: string;
    basePrice: number;
    description?: string;
  };
}

// Interface cho client schedule booking
export interface ScheduleBookingInfo {
  scheduleId: number;
  doctorId: number;
  hourId: number;
  date: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookingInfo?: any;
}

// Interface cho booking mode state management
export interface BookingModeState {
  mode: 'BY_DOCTOR' | 'BY_DATE';
  isLoading: boolean;
  error: string | null;
  selectedDoctor: number | null;
  selectedHour: number | null;
  selectedSlot: TimeSlot | null;
  availableSlots: TimeSlot[];
  disabledDates: Date[];
  doctorSchedules: Schedules[];
}

// Constants cho booking status - simplified
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMING: 'CONFIRMING',
  ACCEPTING: 'ACCEPTING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  CANCELLED: 'CANCELLED'
} as const;

// Constants cho schedule status
export const SCHEDULE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  BUSY: 'BUSY'
} as const;

// Type guards để kiểm tra type safety
export function isValidSchedule(obj: any): obj is Schedules {
  return obj && 
         typeof obj.id === 'number' && 
         typeof obj.date === 'string' && 
         typeof obj.idHour === 'number';
}

export function isValidTimeSlot(obj: any): obj is TimeSlot {
  return obj && 
         typeof obj.hourId === 'number' && 
         typeof obj.hourName === 'string' && 
         typeof obj.doctorId === 'number' && 
         typeof obj.doctorName === 'string';
}

export const schedules: Schedule[] = [
  {
    id: 1,
    idDoctor: 101,
    weekday: 'Monday',
    session: 'Morning',
    date: '12/03/2024',
    note: 'Regular check-up',
    patient: {
      id: 201,
      gender: 'Male',
      dob: '1990-05-15',
    },
  },
  {
    id: 2,
    idDoctor: 102,
    weekday: 'Wednesday',
    session: 'Afternoon',
    date: '13/03/2024',
    note: 'Dental cleaning',
    patient: {
      id: 202,
      gender: 'Female',
      dob: '1985-10-20',
    },
  },
  {
    id: 3,
    idDoctor: 103,
    weekday: 'Friday',
    session: 'Morning',
    date: '14/03/2024',
    note: 'Flu vaccination',
    patient: {
      id: 203,
      gender: 'Male',
      dob: '1978-03-12',
    },
  },
  {
    id: 4,
    idDoctor: 104,
    weekday: 'Tuesday',
    session: 'Morning',
    date: '21/03/2024',
    note: 'Blood pressure check',
    patient: {
      id: 204,
      gender: 'Female',
      dob: '1967-08-25',
    },
  },
  {
    id: 5,
    idDoctor: 105,
    weekday: 'Thursday',
    session: 'Afternoon',
    date: '25/03/2024',
    note: 'Follow-up consultation',
    patient: {
      id: 205,
      gender: 'Male',
      dob: '1982-12-03',
    },
  },
];

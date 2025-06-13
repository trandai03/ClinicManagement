// Enhanced Booking Interface cho luồng khám mới
export interface EnhancedBooking {
  id: number;
  name: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  date: string;
  idHour: number;
  
  // Enhanced status tracking
  status: BookingStatus;
  
  // Timing
  checkedInTime?: Date;
  startTime?: Date;
  endTime?: Date;
  
  // Location
  roomNumber?: string;
  
  // Medical
  initialSymptoms?: string;
  doctorNotes?: string;
  
  // Financial
  totalAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
  
  // Relations
  nameDoctor: string;
  major: string;
  note: string;
  
  // Service requests (nếu có)
  serviceRequests?: ServiceRequest[];
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMING = 'CONFIRMING', 
  ACCEPTING = 'ACCEPTING',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_SERVICES = 'PENDING_SERVICES',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  COMPLETED = 'COMPLETED',
  SUCCESS = 'SUCCESS', // Backward compatibility
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD', 
  TRANSFER = 'TRANSFER',
  INSURANCE = 'INSURANCE'
}

export interface ServiceRequest {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceType: 'MEDICAL_SERVICE' | 'LAB_TEST';
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cost: number;
  requestNotes?: string;
  resultNotes?: string;
  requestedAt: Date;
  completedAt?: Date;
} 
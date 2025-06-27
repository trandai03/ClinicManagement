export interface ExaminationStartDTO {
  roomNumber: string;
  initialSymptoms: string;
  doctorNotes: string;
}

export interface ExaminationCompletionDTO {
  bookingId: number;
  medicines: MedicineData[];
  services: ServiceData[];
  totalAmount: number;
  paymentMethod: string;
  notes: string;
}

export interface UpdateConclusionBookingDTO {
  bookingId: number;
  resultConclusion: string;
  resultNotes: string;
}

export interface MedicineData {
  medicineId: number;
  quantity: number;
  dosage: string;
  instructions: string;
}

export interface ServiceData {
  serviceId: number;
  cost: number;
  requestNotes: string;
}

// Thêm interfaces cho examination details
export interface ExaminationDetailsResponse {
  historyId: number;
  booking: BookingDetailsResponse;
  serviceRequests: ServiceRequestDetailsResponse[];
  prescriptions: PrescriptionDetailsResponse[];
  paymentInfo: PaymentInfoResponse;
}

export interface BookingDetailsResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  date: string;
  hourId: number;
  hourName?: string;
  status: string;
  roomNumber?: string;
  initialSymptoms?: string;
  doctorNotes?: string;
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paidAt?: string;
  major?: string;
  doctorName?: string;
  resultsConclusion?: string;
  resultsNotes?: string;

}

export interface ServiceRequestDetailsResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceType: string;
  status: string;
  cost: number;
  requestNotes?: string;
  resultNotes?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface PrescriptionDetailsResponse {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  dosage: string;
  instructions: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentInfoResponse {
  totalAmount: number;
  consultationFee: number;
  servicesFee: number;
  medicinesFee: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt?: string;
}
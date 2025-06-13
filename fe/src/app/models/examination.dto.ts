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
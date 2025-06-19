export interface History {
    id: number;
    bookingId: number;
    
    // Medical information
    medicalSummary: string;
    diagnosis?: string;
    treatment?: string;
    doctorNotes?: string;
    
    // Timing information
    examinationDate: string;
    startTime: string;
    endTime: string;
    
    // Financial information
    consultationFee: number;
    medicineFee?: number;
    serviceFee?: number;
    totalAmount: number;
    
    // Patient information (from booking)
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientGender: string;
    patientAddress: string;
    
    // Doctor information (from booking)
    doctorName: string;
    majorName: string;
    
    // Legacy fields for backward compatibility
    medicine?: string;
    service?: string;
    fromDate?: string; // Alias for startTime
    toDate?: string;   // Alias for endTime
    bhyt?: string;
    address?: string; // Alias for patientAddress
    name?: string;    // Alias for patientName
    gender?: string;  // Alias for patientGender
    admissionStatus?: string;
    dischargeStatus?: string;
    
    // Legacy compatibility
    image?: string;
    description?: string;
}

export interface HistoryDTO {
    // Booking information
    bookingId: number;
    
    // Medical information
    medicalSummary: string;
    diagnosis?: string;
    treatment?: string;
    doctorNotes?: string;
    
    // Financial information
    consultationFee?: number;
    medicineFee?: number;
    serviceFee?: number;
    totalMoney: number; // Alias for totalAmount
    
    // Legacy fields for backward compatibility
    fullName?: string;
    dob?: string;
    gender?: boolean;
    nation?: string;
    bhyt?: string;
    address?: string;
    fromDate?: string;
    toDate?: string;
    medicineStr?: string;
    serviceStr?: string;
    
    // Legacy compatibility
    name?: string;
    description?: string;
}

// Enhanced History interface for detailed examination results
export interface HistoryDetails extends History {
    prescriptions: PrescriptionDetail[];
    serviceRequests: ServiceRequestDetail[];
    paymentInfo: PaymentInfo;
}

export interface PrescriptionDetail {
    id: number;
    medicineId: number;
    medicineName: string;
    quantity: number;
    dosage: string;
    instructions: string;
    unitPrice: number;
    totalPrice: number;
}

export interface ServiceRequestDetail {
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

export interface PaymentInfo {
    totalAmount: number;
    consultationFee: number;
    servicesFee: number;
    medicinesFee: number;
    paymentMethod: string;
    paymentStatus: string;
    paidAt?: string;
}
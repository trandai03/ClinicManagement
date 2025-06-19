package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryDTO {
    
    // Booking information
    private Long bookingId;
    
    // Medical information
    private String medicalSummary;
    private String diagnosis;
    private String treatment;
    private String doctorNotes;
    
    // Financial information
    private Long consultationFee;
    private Long medicineFee;
    private Long serviceFee;
    private Long totalMoney; // Alias for totalAmount
    
    // Legacy fields for backward compatibility
    private String fullName;
    private Date dob;
    private boolean gender;
    private String nation;
    private String bhyt;
    private String address;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String medicineStr;
    private String serviceStr;
    
    // Getters for backward compatibility
    public Long getTotalAmount() {
        return this.totalMoney;
    }
    
    public void setTotalAmount(Long totalAmount) {
        this.totalMoney = totalAmount;
    }
}

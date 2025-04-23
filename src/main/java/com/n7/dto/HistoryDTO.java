package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryDTO {
    private String fullName;
    private String dob;
    private boolean gender;
    private String nation;
    private String bhyt;
    private String address;
    private String fromDate;
    private String toDate;
    private String medicalSummary;
    private String medicineStr;
    private String serviceStr;
    private Long totalMoney;
    private Long bookingId;
}

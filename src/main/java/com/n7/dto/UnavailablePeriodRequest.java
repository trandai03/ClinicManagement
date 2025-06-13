package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnavailablePeriodRequest {
    private Long idDoctor;
    private String fromDate; // Format: dd/MM/yyyy
    private String toDate; // Format: dd/MM/yyyy
    private String reason;
    private String note;
}
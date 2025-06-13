package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestDTO {
    private Long bookingId;
    private Long serviceId;
    private String requestNotes;
    private String resultNotes;
    private Long cost;
}
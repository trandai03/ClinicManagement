package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleHourDTO {
    private Long id;
    private Long idUser; // Doctor ID
    private Long idHour;
    private String date; // Format: dd/MM/yyyy
    private String status; // AVAILABLE, UNAVAILABLE, BUSY
    private String note;
    private String hourName;

    // Doctor information for BY_DATE booking mode
    private String doctorName;
    private String doctorMajor;
}
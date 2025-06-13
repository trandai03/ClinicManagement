package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleCreateRequest {
    private Long idUser; // Doctor ID
    private String date; // Format: dd/MM/yyyy
    private List<Long> hours; // List of hour IDs
    private String note;
}
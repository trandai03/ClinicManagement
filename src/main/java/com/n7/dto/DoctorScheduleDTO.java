package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDTO {
    private Long id;
    private Long doctorId;
    private String scheduleType; // WORKING, LEAVE, BUSY
    private Byte dayOfWeek; // 1-7 (Mon-Sun)
    private LocalDate specificDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isActive;
    private String note;
}

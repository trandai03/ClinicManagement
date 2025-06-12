package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationStartDTO {
    private String roomNumber;
    private String initialSymptoms;
    private String doctorNotes;
}
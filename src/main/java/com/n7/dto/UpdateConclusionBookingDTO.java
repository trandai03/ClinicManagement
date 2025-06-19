package com.n7.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public  class UpdateConclusionBookingDTO {
    private Long bookingId;
    private String resultConclusion;
    private String resultNotes;
}

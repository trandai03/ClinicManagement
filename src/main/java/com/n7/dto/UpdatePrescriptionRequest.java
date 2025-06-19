package com.n7.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public  class UpdatePrescriptionRequest {
    @Positive(message = "Số lượng phải là số dương")
    private Integer quantity;

    private String dosage;
    private String instructions;
}

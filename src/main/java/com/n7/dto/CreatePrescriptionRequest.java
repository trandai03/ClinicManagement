package com.n7.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePrescriptionRequest {
    @NotNull(message = "History ID không được để trống")
    @Positive(message = "History ID phải là số dương")
    private Long historyId;

    @NotNull(message = "Medicine ID không được để trống")
    @Positive(message = "Medicine ID phải là số dương")
    private Long medicineId;

    @NotNull(message = "Số lượng không được để trống")
    @Positive(message = "Số lượng phải là số dương")
    private Integer quantity;

    @NotNull(message = "Liều dùng không được để trống")
    private String dosage;

    @NotNull(message = "Hướng dẫn sử dụng không được để trống")
    private String instructions;


}

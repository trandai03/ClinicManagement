package com.n7.dto;

import com.n7.service.impl.PrescriptionService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBulkPrescriptionRequest {
    @NotNull(message = "History ID không được để trống")
    @Positive(message = "History ID phải là số dương")
    private Long historyId;

    @NotNull(message = "Danh sách đơn thuốc không được để trống")
    private List<PrescriptionService.PrescriptionRequest> prescriptions;
}

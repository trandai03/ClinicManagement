package com.n7.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleUpdateRequest {

    @NotBlank(message = "Status không được để trống")
    private String status; // AVAILABLE, UNAVAILABLE, BUSY

    private String note; // Ghi chú tùy chọn

    private String reason; // Lý do thay đổi (tùy chọn)
}
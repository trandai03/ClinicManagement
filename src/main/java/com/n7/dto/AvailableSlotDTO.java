package com.n7.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Enhanced DTO for optimized client usage
@Data
@NoArgsConstructor
@AllArgsConstructor
class AvailableSlotDTO {
    private Long hourId;
    private String hourName;
    private String hourTime; // VD: "08:00 - 09:00"
    private Long doctorId;
    private String doctorName;
    private String doctorMajor;
    private String doctorAvatar;
    private String date; // Format: dd/MM/yyyy
    private String status; // AVAILABLE
    private Integer totalSlots; // Tổng số slot trong giờ này
    private Integer availableSlots; // Số slot còn trống
    private Boolean isFullyBooked; // Có bị book hết không
}
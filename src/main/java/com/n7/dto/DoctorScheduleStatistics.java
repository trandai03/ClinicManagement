package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleStatistics {
    private Long doctorId;
    private String doctorName;
    private String fromDate;
    private String toDate;

    // Thống kê tổng quan
    private Integer totalWorkingDays; // Tổng số ngày làm việc
    private Integer totalWorkingHours; // Tổng số giờ làm việc
    private Integer totalAvailableSlots; // Tổng số slot available
    private Integer totalBookedSlots; // Tổng số slot đã được book
    private Integer totalUnavailableSlots; // Tổng số slot không có sẵn

    // Tỷ lệ phần trăm
    private Double bookingRate; // Tỷ lệ được book (%)
    private Double availabilityRate; // Tỷ lệ có sẵn (%)

    // Thống kê theo ngày
    private Map<String, Integer> dailyWorkingHours; // date -> số giờ làm việc
    private Map<String, Integer> dailyBookings; // date -> số booking

    // Thống kê theo giờ
    private Map<String, Integer> hourlyBookings; // hour -> số booking

    // Ngày bận nhất/rảnh nhất
    private String busiestDate;
    private String quietestDate;

    // Giờ được book nhiều nhất/ít nhất
    private String mostPopularHour;
    private String leastPopularHour;
}
package com.n7.service;

import com.n7.dto.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface IDoctorScheduleService {

    // ========== DOCTOR SCHEDULE MANAGEMENT ==========

    // Tạo lịch làm việc cho bác sĩ
    void createDoctorSchedule(DoctorScheduleCreateRequest request);

    // Lấy lịch làm việc của bác sĩ theo khoảng thời gian
    List<DoctorScheduleHourDTO> getDoctorSchedulesByDateRange(Long doctorId, String fromDate, String toDate);

    // Cập nhật lịch làm việc
    void updateDoctorSchedule(Long scheduleId, DoctorScheduleUpdateRequest request);

    // Xóa lịch làm việc cụ thể
    void deleteDoctorSchedule(Long scheduleId);

    // Xóa tất cả lịch của bác sĩ trong một ngày
    void deleteDoctorScheduleByDate(Long doctorId, String date);

    // ========== UNAVAILABLE PERIOD MANAGEMENT ==========

    // Tạo khoảng thời gian không có sẵn
    void createUnavailablePeriod(UnavailablePeriodRequest request);

    // ========== CLIENT BOOKING APIS ==========

    // Lấy tất cả slots có sẵn trong một ngày
    List<DoctorScheduleHourDTO> getAvailableSlotsByDate(String date);

    // Lấy slots có sẵn của một bác sĩ cụ thể
    List<DoctorScheduleHourDTO> getAvailableSlotsByDoctorAndDate(Long doctorId, String date);

    // Lấy available slots theo chuyên khoa và ngày (optimized for client)
    List<AvailableSlotsDTO> getAvailableSlotsByMajorAndDate(Long majorId, String date);

    List<LocalDate> getAvailableSlotsByMajor(Long majorId);
    // Kiểm tra slot có available không
    boolean isSlotAvailable(Long doctorId, Long hourId, String date);

    // ========== STATISTICS & REPORTS ==========

    // Thống kê lịch làm việc của bác sĩ
    DoctorScheduleStatistics getDoctorScheduleStatistics(Long doctorId, String fromDate, String toDate);

    // Lấy danh sách ngày có lịch của bác sĩ
    List<String> getAvailableDatesByDoctor(Long doctorId);
}
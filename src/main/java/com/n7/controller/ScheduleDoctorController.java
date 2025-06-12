package com.n7.controller;

import com.n7.dto.*;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.IDoctorScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/schedule-doctor")
@RequiredArgsConstructor
public class ScheduleDoctorController {

    private final IDoctorScheduleService doctorScheduleService;

    /**
     * Tạo lịch làm việc cho bác sĩ
     */
    @PostMapping("")
    public ResponseEntity<?> createDoctorSchedule(@RequestBody DoctorScheduleCreateRequest request) {
        try {
            doctorScheduleService.createDoctorSchedule(request);
            return ResponseEntity.ok(new SuccessResponse<>("Tạo lịch làm việc thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi tạo lịch làm việc: " + e.getMessage()));
        }
    }

    /**
     * Lấy lịch làm việc của bác sĩ theo khoảng thời gian
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorSchedulesByDateRange(
            @PathVariable Long doctorId,
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        try {
            List<DoctorScheduleHourDTO> schedules = doctorScheduleService
                    .getDoctorSchedulesByDateRange(doctorId, fromDate, toDate);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy lịch làm việc thành công", schedules));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy lịch làm việc: " + e.getMessage()));
        }
    }

    /**
     * Xóa lịch làm việc
     */
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteDoctorSchedule(@PathVariable Long scheduleId) {
        try {
            doctorScheduleService.deleteDoctorSchedule(scheduleId);
            return ResponseEntity.ok(new SuccessResponse<>("Xóa lịch làm việc thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi xóa lịch làm việc: " + e.getMessage()));
        }
    }

    /**
     * Tạo khoảng thời gian không có sẵn (báo bận)
     */
    @PostMapping("/unavailable")
    public ResponseEntity<?> createUnavailablePeriod(@RequestBody UnavailablePeriodRequest request) {
        try {
            doctorScheduleService.createUnavailablePeriod(request);
            return ResponseEntity.ok(new SuccessResponse<>("Báo bận thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi báo bận: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả slots có sẵn trong một ngày (cho booking mode BY_DATE)
     */
    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlotsByDate(@RequestParam String date) {
        try {
            List<DoctorScheduleHourDTO> availableSlots = doctorScheduleService.getAvailableSlotsByDate(date);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy slots có sẵn thành công", availableSlots));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy slots có sẵn: " + e.getMessage()));
        }
    }

    /**
     * Lấy slots có sẵn của một bác sĩ cụ thể (cho booking mode BY_DOCTOR)
     */
    @GetMapping("/available-slots/doctor/{doctorId}")
    public ResponseEntity<?> getAvailableSlotsByDoctorAndDate(
            @PathVariable Long doctorId,
            @RequestParam String date) {
        try {
            List<DoctorScheduleHourDTO> availableSlots = doctorScheduleService
                    .getAvailableSlotsByDoctorAndDate(doctorId, date);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy slots có sẵn của bác sĩ thành công", availableSlots));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy slots có sẵn của bác sĩ: " + e.getMessage()));
        }
    }

    // ========== NEW ENHANCED APIS ==========

    /**
     * Cập nhật lịch làm việc (thay đổi status hoặc note)
     */
    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateDoctorSchedule(
            @PathVariable Long scheduleId,
            @RequestBody DoctorScheduleUpdateRequest request) {
        try {
            doctorScheduleService.updateDoctorSchedule(scheduleId, request);
            return ResponseEntity.ok(new SuccessResponse<>("Cập nhật lịch làm việc thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse<>("Dữ liệu không hợp lệ: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * Xóa tất cả lịch của bác sĩ trong một ngày
     */
    @DeleteMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<?> deleteDoctorScheduleByDate(
            @PathVariable Long doctorId,
            @PathVariable String date) {
        try {
            doctorScheduleService.deleteDoctorScheduleByDate(doctorId, date);
            return ResponseEntity.ok(new SuccessResponse<>("Xóa lịch làm việc ngày " + date + " thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi xóa lịch làm việc: " + e.getMessage()));
        }
    }

    /**
     * Lấy available slots theo chuyên khoa và ngày (optimized for client BY_DATE
     * mode)
     */
    @GetMapping("/available-slots/major/{majorId}")
    public ResponseEntity<?> getAvailableSlotsByMajorAndDate(
            @PathVariable Long majorId,
            @RequestParam String date) {
        try {
            List<AvailableSlotsDTO> slots = doctorScheduleService
                    .getAvailableSlotsByMajorAndDate(majorId, date);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy slots theo chuyên khoa thành công", slots));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy slots theo chuyên khoa: " + e.getMessage()));
        }
    }

    /**
     * Kiểm tra slot có available không trước khi booking
     */
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkSlotAvailability(
            @RequestParam Long doctorId,
            @RequestParam Long hourId,
            @RequestParam String date) {
        try {
            boolean isAvailable = doctorScheduleService.isSlotAvailable(doctorId, hourId, date);
            return ResponseEntity.ok(new SuccessResponse<>("Kiểm tra thành công",
                    Map.of("available", isAvailable)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi kiểm tra: " + e.getMessage()));
        }
    }

    /**
     * Thống kê lịch làm việc của bác sĩ
     */
    @GetMapping("/statistics/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorScheduleStatistics(
            @PathVariable Long doctorId,
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        try {
            DoctorScheduleStatistics stats = doctorScheduleService
                    .getDoctorScheduleStatistics(doctorId, fromDate, toDate);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy thống kê thành công", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy thống kê: " + e.getMessage()));
        }
    }

    @GetMapping("/available-dates/doctor/{doctorId}")
    public ResponseEntity<?> getAvailableDatesByDoctor(@PathVariable Long doctorId) {
        try {
            List<String> availableDates = doctorScheduleService.getAvailableDatesByDoctor(doctorId);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy ngày có lịch thành công", availableDates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy ngày có lịch: " + e.getMessage()));
        }
    }

    /**
     * Lấy available slots theo chuyên khoa và ngày (optimized for client BY_DATE
     * mode)
     */
    @GetMapping("/available-days/major/{majorId}")
    public ResponseEntity<?> getAvailableSlotsByMajor(
            @PathVariable Long majorId) {
        try {
            List<LocalDate> slots = doctorScheduleService
                    .getAvailableSlotsByMajor(majorId);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy slots theo chuyên khoa thành công", slots));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>("Lỗi khi lấy slots theo chuyên khoa: " + e.getMessage()));
        }
    }
}

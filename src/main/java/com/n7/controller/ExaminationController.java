package com.n7.controller;

import com.n7.dto.ExaminationCompletionDTO;
import com.n7.dto.ExaminationStartDTO;
import com.n7.dto.UpdateConclusionBookingDTO;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.ExaminationService;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/examination")
@RequiredArgsConstructor
public class ExaminationController {

    private final ExaminationService examinationService;

    @PostMapping("/start/{bookingId}")
    public ResponseEntity<?> startExamination(@PathVariable Long bookingId,
            @RequestBody ExaminationStartDTO startData) {
        try {
            Map<String, Object> result = examinationService.startExamination(bookingId, startData);
            return ResponseEntity.ok(new SuccessResponse<>("Đã bắt đầu khám bệnh thành công", result));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>(ex.getMessage()));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeExamination(@RequestBody ExaminationCompletionDTO completionData) {
        try {
            examinationService.completeExamination(completionData);
            return ResponseEntity.ok(new SuccessResponse<>("Hoàn thành khám bệnh thành công"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>(ex.getMessage()));
        }
    }

    @PostMapping("/update-conclusion")
    public ResponseEntity<?> updateConclusionResult(@RequestBody UpdateConclusionBookingDTO updateConclusionBookingDTO) {
        try {
            examinationService.updateConclusionResult(updateConclusionBookingDTO);
            System.out.println("updateConclusionBookingDTO" +updateConclusionBookingDTO);
            return ResponseEntity.ok(new SuccessResponse<>("Cập nhật kết luận bác sĩ thành công"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>(ex.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getBookingDetails(@PathVariable Long bookingId) {
        try {
            return examinationService.getBookingById(bookingId)
                    .map(booking -> ResponseEntity.ok(new SuccessResponse<>("Tìm thấy booking", booking)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>(ex.getMessage()));
        }
    }

    @GetMapping("/details/{bookingId}")
    public ResponseEntity<?> getExaminationDetails(@PathVariable Long bookingId) {
        try {
            Object details = examinationService.getExaminationDetails(bookingId);
            return ResponseEntity.ok(new SuccessResponse<>("Lấy chi tiết examination thành công", details));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse<>(ex.getMessage()));
        }
    }
}
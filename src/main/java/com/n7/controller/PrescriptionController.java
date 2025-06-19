package com.n7.controller;

import com.n7.dto.CreateBulkPrescriptionRequest;
import com.n7.dto.CreatePrescriptionRequest;
import com.n7.dto.UpdatePrescriptionRequest;
import com.n7.service.impl.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/prescription")
@RequiredArgsConstructor
@Validated
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    /**
     * Lấy tất cả đơn thuốc theo historyId
     * GET /api/v1/prescription/history/{historyId}
     */
    @GetMapping("/history/{historyId}")
    public ResponseEntity<List<Map<String, Object>>> getPrescriptionsByHistoryId(
            @PathVariable @NotNull @Positive Long historyId) {
        try {
            List<Map<String, Object>> prescriptions = prescriptionService.getPrescriptionsByHistoryId(historyId);
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Lấy đơn thuốc theo ID
     * GET /api/v1/prescription/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPrescriptionById(
            @PathVariable @NotNull @Positive Long id) {
        try {
            Map<String, Object> prescription = prescriptionService.getPrescriptionById(id);
            return ResponseEntity.ok(prescription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    /**
     * Tạo đơn thuốc mới
     * POST /api/v1/prescription
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPrescription(
            @RequestBody @Valid CreatePrescriptionRequest request) {
        try {
            Map<String, Object> prescription = prescriptionService.createPrescription(
                    request.getHistoryId(),
                    request.getMedicineId(),
                    request.getQuantity(),
                    request.getDosage(),
                    request.getInstructions()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(prescription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    /**
     * Tạo nhiều đơn thuốc cùng lúc
     * POST /api/v1/prescription/bulk
     */
    @PostMapping("/bulk")
    public ResponseEntity<List<Map<String, Object>>> createPrescriptions(
            @RequestBody @Valid CreateBulkPrescriptionRequest request) {
        try {
            List<Map<String, Object>> prescriptions = prescriptionService.createPrescriptions(
                    request.getHistoryId(),
                    request.getPrescriptions()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(prescriptions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    /**
     * Cập nhật đơn thuốc
     * PUT /api/v1/prescription/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePrescription(
            @PathVariable @NotNull @Positive Long id,
            @RequestBody @Valid UpdatePrescriptionRequest request) {
        try {
            Map<String, Object> prescription = prescriptionService.updatePrescription(
                    id,
                    request.getQuantity(),
                    request.getDosage(),
                    request.getInstructions()
            );
            return ResponseEntity.ok(prescription);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    /**
     * Xóa đơn thuốc
     * DELETE /api/v1/prescription/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(
            @PathVariable @NotNull @Positive Long id) {
        try {
            prescriptionService.deletePrescription(id);
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    /**
     * Xóa tất cả đơn thuốc theo historyId
     * DELETE /api/v1/prescription/history/{historyId}
     */
    @DeleteMapping("/history/{historyId}")
    public ResponseEntity<?> deletePrescriptionsByHistoryId(
            @PathVariable @NotNull @Positive Long historyId) {
        try {
            prescriptionService.deletePrescriptionsByHistoryId(historyId);
            return ResponseEntity.ok("Xóa tất cả đơn thuốc thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xóa đơn thuốc: " + e.getMessage()));
        }
    }

    /**
     * Tính tổng giá thuốc theo historyId
     * GET /api/v1/prescription/history/{historyId}/total-fee
     */
    @GetMapping("/history/{historyId}/total-fee")
    public ResponseEntity<?> calculateTotalMedicineFee(
            @PathVariable @NotNull @Positive Long historyId) {
        try {
            Long totalFee = prescriptionService.calculateTotalMedicineFee(historyId);
            return ResponseEntity.ok(totalFee);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi tính tổng phí thuốc: " + e.getMessage()));
        }
    }

    // DTO Classes




}

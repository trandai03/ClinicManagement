package com.n7.controller;

import com.n7.constant.Status;
import com.n7.dto.HistoryDTO;
import com.n7.entity.Booking;
import com.n7.entity.History;
import com.n7.model.HistoryModel;
import com.n7.service.impl.BookingService;
import com.n7.service.impl.HistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/histories")
public class HistoryController {
    @Autowired
    private HistoryService historyService;
    @Autowired
    private BookingService bookingService;

    @GetMapping("")
    public ResponseEntity<List<HistoryModel>> getHistory() {
        try {
            List<History> histories = historyService.getAllHistory();
            return ResponseEntity.ok(HistoryModel.fromEntityList(histories));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HistoryModel> getHistoryById(@PathVariable Long id) {
        try {
            History history = historyService.findById(id);
            return ResponseEntity.ok(HistoryModel.fromEntity(history));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<HistoryModel> getHistoryByBookingId(@PathVariable Long bookingId) {
        try {
            Optional<History> historyOpt = historyService.findByBookingId(bookingId);
            if (historyOpt.isPresent()) {
                return ResponseEntity.ok(HistoryModel.fromEntity(historyOpt.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<HistoryModel>> getHistoriesByDoctorId(@PathVariable Long doctorId) {
        try {
            List<History> histories = historyService.getHistoriesByDoctorId(doctorId);
            return ResponseEntity.ok(HistoryModel.fromEntityList(histories));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/exportResult/{bookingId}")
    public ResponseEntity<?> downloadFileByBookingId(@PathVariable Long bookingId) {
        try {
            String filePath = historyService.buildFileExportHistory(bookingId);
            File fileToDownload = new File(filePath);
            
            if (fileToDownload.exists()) {
                InputStream inputStream = new FileInputStream(fileToDownload);
                String fileName = "Hoa_don_kham_benh_" + bookingId + ".pdf";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", fileName);
                
                InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(inputStreamResource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("")
    public ResponseEntity<HistoryModel> saveHistory(@RequestBody HistoryDTO historyDTO) {
        try {
            Optional<Booking> bookingOpt = bookingService.findById(historyDTO.getBookingId());
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Booking booking = bookingOpt.get();
            
            // Chỉ cho phép tạo history từ các trạng thái hợp lệ
            if (booking.getStatus() == Status.ACCEPTING || 
                booking.getStatus() == Status.IN_PROGRESS || 
                booking.getStatus() == Status.AWAITING_RESULTS) {
                
                History history = historyService.saveHistory(historyDTO);
                return ResponseEntity.ok(HistoryModel.fromEntity(history));
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHistory(@PathVariable Long id) {
        try {
            History history = historyService.findById(id);
            historyService.deleteHistory(history);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HistoryModel> updateHistory(@RequestBody HistoryDTO historyDTO, @PathVariable Long id) {
        try {
            History history = historyService.updateHistory(historyDTO, id);
            return ResponseEntity.ok(HistoryModel.fromEntity(history));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{historyId}/fees")
    public ResponseEntity<?> updateHistoryFees(
            @PathVariable Long historyId,
            @RequestParam(required = false) Long medicineFee,
            @RequestParam(required = false) Long serviceFee) {
        try {
            historyService.updateHistoryFees(historyId, medicineFee, serviceFee);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/create-from-examination")
    public ResponseEntity<HistoryModel> createHistoryFromExamination(
            @RequestParam Long bookingId,
            @RequestParam String medicalSummary,
            @RequestParam(required = false) String diagnosis,
            @RequestParam(required = false) String treatment,
            @RequestParam Long totalAmount) {
        try {
            History history = historyService.createHistoryFromExamination(
                    bookingId, medicalSummary, diagnosis, treatment, totalAmount);
            return ResponseEntity.ok(HistoryModel.fromEntity(history));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Xuất báo cáo hóa đơn thanh toán
     * GET /api/v1/histories/export-invoice/{historyId}
     */
    @GetMapping("/export-invoice/{historyId}")
    public ResponseEntity<?> exportInvoice(@PathVariable Long historyId) {
        try {
            String filePath = historyService.buildPrescriptionInvoice(historyId);
            File fileToDownload = new File(filePath);
            
            if (fileToDownload.exists()) {
                InputStream inputStream = new FileInputStream(fileToDownload);
                String fileName = "Hoa_don_" + historyId + "_" + System.currentTimeMillis() + ".pdf";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", fileName);
                
                InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(inputStreamResource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo hóa đơn: " + e.getMessage());
        }
    }

    /**
     * Xuất báo cáo đơn thuốc
     * GET /api/v1/histories/export-prescription/{historyId}
     */
    @GetMapping("/export-prescription/{historyId}")
    public ResponseEntity<?> exportPrescription(@PathVariable Long historyId) {
        try {
            String filePath = historyService.buildPrescriptionReport(historyId);
            File fileToDownload = new File(filePath);
            
            if (fileToDownload.exists()) {
                InputStream inputStream = new FileInputStream(fileToDownload);
                String fileName = "Don_thuoc_" + historyId + "_" + System.currentTimeMillis() + ".pdf";
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", fileName);
                
                InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(inputStreamResource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo đơn thuốc: " + e.getMessage());
        }
    }
}

package com.n7.service.impl;

import com.n7.constant.Status;
import com.n7.dto.ExaminationCompletionDTO;
import com.n7.dto.ExaminationStartDTO;
import com.n7.dto.UpdateConclusionBookingDTO;
import com.n7.entity.*;
import com.n7.exception.ResourceNotFoundException;
import com.n7.model.ServiceRequestModel;
import com.n7.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExaminationService {

    private final BookingRepo bookingRepo;
    private final HistoryRepo historyRepo;
    private final ServiceRequestRepository serviceRequestRepo;
    private final PrescriptionRepository prescriptionRepo;
    private final MedicineRepo medicineRepo;
    private final MedicalServiceRepo medicalServiceRepo;
    private final HistoryService historyService;

    /**
     * Cập nhật trạng thái booking với thông tin thời gian phù hợp
     */
    @Transactional
    public void updateBookingStatus(Long bookingId, Status status) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(status);

        switch (status) {
            case IN_PROGRESS:
                booking.setStartTime(LocalDateTime.now());
                break;
            case SUCCESS:
                booking.setEndTime(LocalDateTime.now());
                booking.setPaymentStatus("PAID");
                booking.setPaidAt(LocalDateTime.now());
                break;
        }

        bookingRepo.save(booking);
    }

    /**
     * Bắt đầu cuộc khám bệnh với thông tin khởi tạo
     */
    @Transactional
    public Map<String, Object> startExamination(Long bookingId, ExaminationStartDTO startData) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(Status.IN_PROGRESS);
        booking.setStartTime(LocalDateTime.now());
        booking.setRoomNumber(startData.getRoomNumber());
        
        // Kết hợp triệu chứng ban đầu và ghi chú bác sĩ
        String combinedNotes = buildCombinedNotes(startData.getInitialSymptoms(), startData.getDoctorNotes());
        booking.setNote(combinedNotes);

        bookingRepo.save(booking);

        // Tạo History record ngay khi bắt đầu khám
        History history = History.builder()
                .booking(booking)
                .medicalSummary(startData.getInitialSymptoms())
                .doctorNotes(startData.getDoctorNotes())
                .examinationDate(LocalDateTime.now())
                .startTime(LocalDateTime.now())
                .consultationFee(booking.getUser().getDoctorRank().getBasePrice()) // Phí khám mặc định
                .medicineFee(0L)
                .serviceFee(0L)
                .totalAmount(booking.getUser().getDoctorRank().getBasePrice()) // Chỉ phí khám ban đầu
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        History savedHistory = historyRepo.save(history);

        // Trả về response chứa historyId
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bắt đầu khám bệnh thành công");
        response.put("historyId", savedHistory.getId());
        response.put("bookingId", bookingId);
        response.put("status", "IN_PROGRESS");

        return response;
    }

    /**
     * Hoàn thành cuộc khám bệnh với đầy đủ thông tin thuốc và dịch vụ
     */

    public void completeExamination(ExaminationCompletionDTO completionData) {
        Booking booking = bookingRepo.findById(completionData.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // 1. Cập nhật trạng thái booking
        updateBookingForCompletion(booking, completionData);

        // 2. Cập nhật bản ghi History
        History history = historyRepo.findByBookingId(completionData.getBookingId()).orElseThrow(() -> new ResourceNotFoundException("History of booking not found"));
        historyService.updateHistoryCompleted(history, completionData);
        // 3. Xử lý đơn thuốc và tính phí thuốc
        long totalMedicineFee = processPrescriptions(history, completionData.getMedicines());

        // 4. Xử lý dịch vụ y tế và tính phí dịch vụ
        long totalServiceFee = processServiceRequests(booking, history);

        // 5. Cập nhật tổng chi phí cuối cùng
        updateFinalTotals(booking, history, totalMedicineFee, totalServiceFee);
    }

    public void updateConclusionResult(UpdateConclusionBookingDTO updateConclusionBookingDTO){
        Booking booking = bookingRepo.findById(updateConclusionBookingDTO.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setResultsConclusion(updateConclusionBookingDTO.getResultConclusion());
        booking.setResultsNotes(updateConclusionBookingDTO.getResultNotes());
        bookingRepo.save(booking);
    }

    /**
     * Lấy thông tin chi tiết cuộc khám bệnh
     */
    public Map<String, Object> getExaminationDetails(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Map<String, Object> response = new HashMap<>();

        // Thông tin booking cơ bản
        response.put("booking", createBookingDetailsMap(booking));

        // Tìm history liên quan
        Optional<History> historyOpt = historyRepo.findByBookingId(bookingId).stream().findFirst();

        if (historyOpt.isPresent()) {
            History history = historyOpt.get();
            
            // Thông tin đơn thuốc
            response.put("prescriptions", getPrescriptionDetails(history.getId()));
            
            // Thông tin dịch vụ y tế
            response.put("serviceRequests", getServiceRequestDetails(booking.getId()));
            
            // Thông tin thanh toán từ history
            response.put("paymentInfo", createPaymentInfoMap(history, booking));
        } else {
            // Fallback cho booking chưa có history
            response.put("prescriptions", new ArrayList<>());
            response.put("serviceRequests", getServiceRequestsFromBooking(bookingId));
            response.put("paymentInfo", createBasicPaymentInfoMap(booking));
        }

        return response;
    }

    /**
     * Lấy booking theo ID
     */
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepo.findById(id);
    }

    // ===================== PRIVATE HELPER METHODS =====================

    /**
     * Kết hợp triệu chứng ban đầu và ghi chú bác sĩ
     */
    private String buildCombinedNotes(String initialSymptoms, String doctorNotes) {
        StringBuilder notes = new StringBuilder();
        if (initialSymptoms != null && !initialSymptoms.trim().isEmpty()) {
            notes.append(initialSymptoms);
        }
        if (doctorNotes != null && !doctorNotes.trim().isEmpty()) {
            if (notes.length() > 0) {
                notes.append("\n");
            }
            notes.append(doctorNotes);
        }
        return notes.toString();
    }

    /**
     * Cập nhật booking khi hoàn thành khám
     */
    private void updateBookingForCompletion(Booking booking, ExaminationCompletionDTO completionData) {
        booking.setStatus(Status.SUCCESS);
        booking.setEndTime(LocalDateTime.now());
        booking.setTotalAmount(completionData.getTotalAmount());
        booking.setPaymentStatus("PAID");
        booking.setPaymentMethod(completionData.getPaymentMethod());
        booking.setPaidAt(LocalDateTime.now());
        bookingRepo.save(booking);
    }

    /**
     * Tạo bản ghi History với thông tin đầy đủ
     */
    private History createHistoryRecord(Booking booking, ExaminationCompletionDTO completionData) {
        History history = History.builder()
                .booking(booking)
                .medicalSummary(completionData.getNotes())
                .doctorNotes(completionData.getNotes())
                .examinationDate(LocalDateTime.now())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .consultationFee(200000L) // Phí khám mặc định
                .totalAmount(completionData.getTotalAmount())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return historyRepo.save(history);
    }

    /**
     * Xử lý đơn thuốc và tính tổng phí thuốc
     */
    private long processPrescriptions(History history, List<ExaminationCompletionDTO.MedicineData> medicines) {
        if (medicines == null || medicines.isEmpty()) {
            return 0L;
        }

        List<Prescription> prescriptions = new ArrayList<>();
        long totalMedicineFee = 0L;

        for (ExaminationCompletionDTO.MedicineData medicineData : medicines) {
            Medicine medicine = medicineRepo.findById(medicineData.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

            long totalPrice = medicine.getMoney() * medicineData.getQuantity();
            totalMedicineFee += totalPrice;

            Prescription prescription = Prescription.builder()
                    .historyId(history.getId())
                    .medicine(medicine)
                    .quantity(medicineData.getQuantity())
                    .dosage(medicineData.getDosage())
                    .instructions(medicineData.getInstructions())
                    .unitPrice(medicine.getMoney())
                    .totalPrice(totalPrice)
                    .build();

            prescriptions.add(prescription);
        }

        prescriptionRepo.saveAll(prescriptions);
        
        // Cập nhật phí thuốc vào history
        history.setMedicineFee(totalMedicineFee);
        historyRepo.save(history);

        return totalMedicineFee;
    }

    /**
     * Xử lý dịch vụ y tế và tính tổng phí dịch vụ
     */
    private long    processServiceRequests(Booking booking, History history) {
        List<ServiceRequest> serviceRequests = booking.getServiceRequests();
        long totalServiceFee = 0L;

        for (ServiceRequest serviceRequest : serviceRequests) {
            totalServiceFee += serviceRequest.getCost();
            serviceRequest.setCompletedAt(LocalDateTime.now());
            serviceRequest.setStatus("COMPLETED");
        }
        serviceRequestRepo.saveAll(serviceRequests);
        
        // Cập nhật phí dịch vụ vào history
        history.setServiceFee(totalServiceFee);
        historyRepo.save(history);

        return totalServiceFee;
    }

    /**
     * Cập nhật tổng chi phí cuối cùng
     */
    private void updateFinalTotals(Booking booking, History history, long medicineFee, long serviceFee) {
        long finalTotal = history.getConsultationFee() + medicineFee + serviceFee;
        history.setMedicineFee(medicineFee);
        history.setServiceFee(serviceFee);
        history.setTotalAmount(finalTotal);
        historyRepo.save(history);
        
        booking.setTotalAmount(finalTotal);
        bookingRepo.save(booking);
    }

    /**
     * Tạo map thông tin booking chi tiết
     */
    private Map<String, Object> createBookingDetailsMap(Booking booking) {
        Map<String, Object> details = new HashMap<>();
        details.put("id", booking.getId());
        details.put("name", booking.getFullName());
        details.put("email", booking.getEmail());
        details.put("phone", booking.getPhone());
        details.put("gender", booking.getGender());
        details.put("dob", booking.getDob());
        details.put("date", booking.getDate());
        details.put("hourId", booking.getIdHour());
        details.put("status", booking.getStatus());
        details.put("roomNumber", booking.getRoomNumber());
        details.put("initialSymptoms", booking.getNote());
        details.put("doctorNotes", booking.getNote());
        details.put("startTime", booking.getStartTime());
        details.put("endTime", booking.getEndTime());
        details.put("totalAmount", booking.getTotalAmount());
        details.put("paymentMethod", booking.getPaymentMethod());
        details.put("paymentStatus", booking.getPaymentStatus());
        details.put("paidAt", booking.getPaidAt());
        return details;
    }

    /**
     * Lấy thông tin đơn thuốc chi tiết
     */
    private List<Map<String, Object>> getPrescriptionDetails(Long historyId) {
        List<Prescription> prescriptions = prescriptionRepo.findByHistoryIdWithMedicine(historyId);
        return prescriptions.stream()
                .map(this::createPrescriptionDetailsMap)
                .collect(Collectors.toList());
    }

    /**
     * Tạo map thông tin đơn thuốc chi tiết
     */
    private Map<String, Object> createPrescriptionDetailsMap(Prescription prescription) {
        Map<String, Object> details = new HashMap<>();
        details.put("id", prescription.getId());
        details.put("medicineId", prescription.getMedicine().getId());
        details.put("medicineName", prescription.getMedicine().getName());
        details.put("quantity", prescription.getQuantity());
        details.put("dosage", prescription.getDosage());
        details.put("instructions", prescription.getInstructions());
        details.put("unitPrice", prescription.getUnitPrice());
        details.put("totalPrice", prescription.getTotalPrice());
        return details;
    }

    /**
     * Lấy thông tin dịch vụ y tế chi tiết
     */
    private List<Map<String, Object>> getServiceRequestDetails(Long bookingId) {
        List<ServiceRequest> serviceRequests = serviceRequestRepo.findByBooking_Id(bookingId);
        return serviceRequests.stream()
                .map(this::createServiceRequestDetailsMap)
                .collect(Collectors.toList());
    }

    /**
     * Tạo map thông tin dịch vụ y tế chi tiết
     */
    private Map<String, Object> createServiceRequestDetailsMap(ServiceRequest serviceRequest) {
        Map<String, Object> details = new HashMap<>();
        details.put("id", serviceRequest.getId());
        details.put("serviceId", serviceRequest.getMedicalService().getId());
        details.put("serviceName", serviceRequest.getMedicalService().getName());
        details.put("serviceType", serviceRequest.getServiceType());
        details.put("status", serviceRequest.getStatus());
        details.put("cost", serviceRequest.getCost());
        details.put("requestNotes", serviceRequest.getRequestNotes());
        details.put("resultNotes", serviceRequest.getResultNotes());
        details.put("requestedAt", serviceRequest.getRequestedAt());
        details.put("completedAt", serviceRequest.getCompletedAt());
        return details;
    }

    /**
     * Lấy service requests từ booking (fallback)
     */
    private List<ServiceRequestModel> getServiceRequestsFromBooking(Long bookingId) {
        return ServiceRequestModel.fromEntityToModals(serviceRequestRepo.findByBooking_Id(bookingId));
    }

    /**
     * Tạo map thông tin thanh toán từ history và booking
     */
    private Map<String, Object> createPaymentInfoMap(History history, Booking booking) {
        Map<String, Object> paymentInfo = new HashMap<>();
        paymentInfo.put("totalAmount", history.getTotalAmount());
        paymentInfo.put("consultationFee", history.getConsultationFee());
        paymentInfo.put("servicesFee", history.getServiceFee() != null ? history.getServiceFee() : 0L);
        paymentInfo.put("medicinesFee", history.getMedicineFee() != null ? history.getMedicineFee() : 0L);
        paymentInfo.put("paymentMethod", booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "CASH");
        paymentInfo.put("paymentStatus", booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "PAID");
        paymentInfo.put("paidAt", booking.getPaidAt());
        return paymentInfo;
    }

    /**
     * Tạo map thông tin thanh toán cơ bản (fallback)
     */
    private Map<String, Object> createBasicPaymentInfoMap(Booking booking) {
        Map<String, Object> paymentInfo = new HashMap<>();
        paymentInfo.put("totalAmount", booking.getTotalAmount() != null ? booking.getTotalAmount() : 0L);
        paymentInfo.put("consultationFee", 200000L);
        paymentInfo.put("servicesFee", 0L);
        paymentInfo.put("medicinesFee", 0L);
        paymentInfo.put("paymentMethod", booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "CASH");
        paymentInfo.put("paymentStatus", booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "PAID");
        paymentInfo.put("paidAt", booking.getPaidAt());
        return paymentInfo;
    }
}

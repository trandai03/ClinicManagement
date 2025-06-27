package com.n7.service.impl;

import com.n7.constant.Status;
import com.n7.dto.ExaminationCompletionDTO;
import com.n7.dto.HistoryDTO;
import com.n7.entity.Booking;
import com.n7.entity.History;
import com.n7.entity.Prescription;
import com.n7.entity.ServiceRequest;
import com.n7.model.HistoryModel;
import com.n7.repository.BookingRepo;
import com.n7.repository.HistoryRepo;
import com.n7.repository.PrescriptionRepository;
import com.n7.repository.ServiceRequestRepository;
import com.n7.utils.ConvertTimeUtils;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HistoryService {
    private final HistoryRepo historyRepo;
    private final BookingRepo bookingRepo;
    private final PrescriptionRepository prescriptionRepo;
    private final ServiceRequestRepository serviceRequestRepo;
    
    @Value("${TEMPLATE_PATH}")
    private String templateFolder;

    @Value("${FILE_TEMP_UPLOAD_PATH}")
    private String fileNameFullFolder;

    @Autowired
    private DataSource dataSource;

    public List<History> getAllHistory() {
        return historyRepo.findAll();
    }

    @Transactional
    public History saveHistory(HistoryDTO historyDTO) {
        // Tìm booking liên quan
        Booking booking = bookingRepo.findById(historyDTO.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking không tìm thấy"));

        // Tạo History với entity mới
        History history = History.builder()
                .booking(booking)
                .medicalSummary(historyDTO.getMedicalSummary())
                .diagnosis(historyDTO.getDiagnosis())
                .treatment(historyDTO.getTreatment())
                .doctorNotes(historyDTO.getDoctorNotes())
                .examinationDate(LocalDateTime.now())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .consultationFee(booking.getUser().getDoctorRank().getBasePrice()) // Phí khám cơ bản
                .totalAmount(historyDTO.getTotalMoney())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        history = historyRepo.save(history);

        // Cập nhật trạng thái booking thành SUCCESS nếu đang ở ACCEPTING hoặc AWAITING_RESULTS
        if (booking.getStatus() == Status.ACCEPTING || 
            booking.getStatus() == Status.AWAITING_RESULTS || 
            booking.getStatus() == Status.IN_PROGRESS) {
            booking.setStatus(Status.SUCCESS);
            booking.setEndTime(LocalDateTime.now());
            booking.setPaymentStatus("PAID");
            booking.setPaidAt(LocalDateTime.now());
            bookingRepo.save(booking);
        }

        return history;
    }

    @Transactional
    public History updateHistory(HistoryDTO historyDTO, Long id) {
        History history = historyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("History không tìm thấy"));
        
        // Cập nhật các field
        history.setMedicalSummary(historyDTO.getMedicalSummary());
        history.setDiagnosis(historyDTO.getDiagnosis());
        history.setTreatment(historyDTO.getTreatment());
        history.setDoctorNotes(historyDTO.getDoctorNotes());
        history.setTotalAmount(historyDTO.getTotalMoney());
        history.setUpdatedAt(LocalDateTime.now());

        return historyRepo.save(history);
    }

    @Transactional
    public void deleteHistory(History history) {
        historyRepo.deleteById(history.getId());
    }

    public History findById(Long id) {
        return historyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("History không tìm thấy"));
    }

    /**
     * Tìm History theo booking ID
     */
    public Optional<History> findByBookingId(Long bookingId) {
        return historyRepo.findByBookingId(bookingId)
                .stream().findFirst();
    }

    /**
     * Tạo History từ ExaminationCompletionDTO (dành cho workflow mới)
     */
    @Transactional
    public History createHistoryFromExamination(Long bookingId, String medicalSummary, 
                                              String diagnosis, String treatment, 
                                              Long totalAmount) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking không tìm thấy"));

        History history = History.builder()
                .booking(booking)
                .medicalSummary(medicalSummary)
                .diagnosis(diagnosis)
                .treatment(treatment)
                .examinationDate(LocalDateTime.now())
                .startTime(booking.getStartTime())
                .endTime(LocalDateTime.now())
                .consultationFee(200000L)
                .totalAmount(totalAmount)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return historyRepo.save(history);
    }

    /**
     * Cập nhật History với medicine và service fees
     */
    @Transactional
    public void updateHistoryFees(Long historyId, Long medicineFee, Long serviceFee) {
        History history = findById(historyId);
        
        history.setMedicineFee(medicineFee);
        history.setServiceFee(serviceFee);
        
        // Tính lại tổng tiền
        Long totalAmount = history.getConsultationFee() +
                (medicineFee != null ? medicineFee : 0L) +
                (serviceFee != null ? serviceFee : 0L);
        
        history.setTotalAmount(totalAmount);
        history.setUpdatedAt(LocalDateTime.now());
        
        historyRepo.save(history);
    }

    public String buildFileExportHistory(Long bookingId) {
        Map<String, Object> paramsReport = new HashMap<>();
        
        // Tìm history theo booking ID
        History history = historyRepo.findByBookingId(bookingId)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("History không tìm thấy cho booking ID: " + bookingId));

        Booking booking = history.getBooking();
        
        // Chuẩn bị parameters cho report
//        paramsReport.put("fullName", booking.getFullName());
//        paramsReport.put("bhyt", booking.getBhyt() != null ? booking.getBhyt() : "");
//        paramsReport.put("dob", ConvertTimeUtils.convertLocalDateTimeToString(booking.getDob()));
//        paramsReport.put("fromDate", ConvertTimeUtils.convertLocalDateTimeToString(history.getStartTime()));
//        paramsReport.put("toDate", ConvertTimeUtils.convertLocalDateTimeToString(history.getEndTime()));
//        paramsReport.put("totalMoney", history.getTotalAmount().toString());
//        paramsReport.put("reason", history.getMedicalSummary());
//        paramsReport.put("diagnosis", history.getDiagnosis() != null ? history.getDiagnosis() : "");
//        paramsReport.put("treatment", history.getTreatment() != null ? history.getTreatment() : "");
//        paramsReport.put("gender", booking.getGender().toString());
//        paramsReport.put("consultationFee", history.getConsultationFee().toString());
//        paramsReport.put("medicineFee", history.getMedicineFee() != null ? history.getMedicineFee().toString() : "0");
//        paramsReport.put("serviceFee", history.getServiceFee() != null ? history.getServiceFee().toString() : "0");

        String fileName = "Lich_su_kham_" + Calendar.getInstance().getTimeInMillis() + ".pdf";
        String fileNameFull = this.fileNameFullFolder + File.separator + fileName;

        File templateFile = new File(templateFolder, "doan.jrxml");
        try {
            JasperReport jasperReport = JasperCompileManager.compileReport(templateFile.getAbsolutePath());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, paramsReport, new JREmptyDataSource());
            byte[] fileInBytes = JasperExportManager.exportReportToPdf(jasperPrint);
            FileUtils.writeByteArrayToFile(new File(fileNameFull), fileInBytes);
            return fileNameFull;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo file PDF: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách History theo trạng thái booking
     */
//    public List<History> getHistoriesByBookingStatus(Status status) {
//        return historyRepo.findByBooking_Status(status);
//    }

    /**
     * Lấy danh sách History theo doctor ID
     */
    public List<History> getHistoriesByDoctorId(Long doctorId) {
        return historyRepo.findByDoctor(doctorId);
    }

    public void updateHistoryCompleted(History history, ExaminationCompletionDTO completionData){
        history.setMedicalSummary(completionData.getNotes());
        history.setUpdatedAt(LocalDateTime.now());
        historyRepo.save(history);
    }

    /**
     * Xuất báo cáo hóa đơn thanh toán
     */
    public String buildPrescriptionInvoice(Long historyId) {
        try {
            Map<String, Object> paramsReport = new HashMap<>();
            
            // Tìm history theo ID
            History history = historyRepo.findById(historyId)
                    .orElseThrow(() -> new RuntimeException("History không tìm thấy cho ID: " + historyId));

            Booking booking = history.getBooking();
            
            // Chuẩn bị parameters cho hóa đơn theo template payment_invoice.jrxml
            paramsReport.put("clinicName", "Phòng khám Tâm Anh");
            paramsReport.put("clinicAddress", "Địa chỉ: Hà Nội | Điện thoại: 0999997777");
            paramsReport.put("invoiceNumber", "HD" + System.currentTimeMillis());
            paramsReport.put("invoiceDate", ConvertTimeUtils.convertLocalDatetime(LocalDateTime.now()));
            paramsReport.put("patientName", booking.getFullName());
            paramsReport.put("patientPhone", booking.getPhone() != null ? booking.getPhone() : "");
            paramsReport.put("patientEmail", booking.getEmail() != null ? booking.getEmail() : "");
            paramsReport.put("patientGender", booking.getGender() != null ? booking.getGender().toString() : "");
            paramsReport.put("patientDob", ConvertTimeUtils.convertDate(booking.getDob()));
            paramsReport.put("doctorName", booking.getUser().getFullname());
            paramsReport.put("majorName", booking.getUser().getMajor().getName());
            paramsReport.put("examinationDate", ConvertTimeUtils.convertLocalDatetime(history.getExaminationDate()));
            paramsReport.put("consultationFee", formatMoneyForTemplate(history.getConsultationFee()));
            paramsReport.put("medicineFee", formatMoneyForTemplate(history.getMedicineFee()));
            paramsReport.put("serviceFee", formatMoneyForTemplate(history.getServiceFee()));
            paramsReport.put("totalAmount", formatMoneyForTemplate(history.getTotalAmount()));
            paramsReport.put("paymentMethod", getPaymentMethodText(booking.getPaymentStatus()));
            paramsReport.put("cashierName", "Thu ngân");

            // Tạo DataSource cho danh sách dịch vụ
            List<ServiceRequest> serviceRequests = serviceRequestRepo.findByHistoryId(historyId);
            
            // Chuyển đổi serviceRequests thành List<Map> cho JasperReports
            List<Map<String, Object>> serviceDataList = new ArrayList<>();
            for (ServiceRequest serviceRequest : serviceRequests) {
                Map<String, Object> serviceData = new HashMap<>();
                serviceData.put("serviceName", serviceRequest.getMedicalService().getName());
//                serviceData.put("serviceType", serviceRequest.getMedicalService().getDescription() != null ?
//                    serviceRequest.getMedicalService().getDescription() : "Dịch vụ y tế");
                serviceData.put("serviceType", "Dịch vụ y tế");
                serviceData.put("serviceCost", serviceRequest.getCost());
                serviceData.put("serviceStatus", serviceRequest.getStatus());
                serviceDataList.add(serviceData);
            }

            // Tạo JRBeanCollectionDataSource từ danh sách dịch vụ
            JRBeanCollectionDataSource serviceDataSource = new JRBeanCollectionDataSource(serviceDataList);

            String fileName = "Hoa_don_" + booking.getFullName().replaceAll("\\s+", "_") + "_" + Calendar.getInstance().getTimeInMillis() + ".pdf";
            String fileNameFull = this.fileNameFullFolder + File.separator + fileName;

            File templateFile = new File(templateFolder, "payment_invoice.jrxml");
            
            JasperReport jasperReport = JasperCompileManager.compileReport(templateFile.getAbsolutePath());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, paramsReport, serviceDataSource);
            byte[] fileInBytes = JasperExportManager.exportReportToPdf(jasperPrint);
            FileUtils.writeByteArrayToFile(new File(fileNameFull), fileInBytes);
            return fileNameFull;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo file hóa đơn PDF: " + e.getMessage());
        }
    }

    /**
     * Xuất báo cáo đơn thuốc
     */
    public String buildPrescriptionReport(Long historyId) {
        try {
            Map<String, Object> paramsReport = new HashMap<>();
            
            // Tìm history theo ID
            History history = historyRepo.findById(historyId)
                    .orElseThrow(() -> new RuntimeException("History không tìm thấy cho ID: " + historyId));

            Booking booking = history.getBooking();
            
            // Chuẩn bị parameters cho đơn thuốc theo template JRXML
            paramsReport.put("patientName", booking.getFullName());
            paramsReport.put("patientPhone", booking.getPhone() != null ? booking.getPhone() : "");
            paramsReport.put("patientGender", booking.getGender().toString());
            paramsReport.put("patientDob", ConvertTimeUtils.convertDate(booking.getDob()));
            paramsReport.put("doctorName", booking.getUser().getFullname());
            paramsReport.put("majorName", booking.getUser().getMajor().getName());
            paramsReport.put("prescriptionDate", ConvertTimeUtils.convertLocalDatetime(LocalDateTime.now()));
            paramsReport.put("diagnosis", history.getDiagnosis() != null ? history.getDiagnosis() : "");
            paramsReport.put("totalMedicineFee", formatMoney(history.getMedicineFee()));
            paramsReport.put("doctorNotes", booking.getResultsNotes() != null ? booking.getResultsNotes() : "");

            // Tạo DataSource cho danh sách thuốc
            List<Prescription> prescriptions = prescriptionRepo.findByHistoryId(historyId);
            
            // Chuyển đổi prescriptions thành List<Map> cho JasperReports
            List<Map<String, Object>> medicineDataList = new ArrayList<>();
            for (Prescription prescription : prescriptions) {
                Map<String, Object> medicineData = new HashMap<>();
                medicineData.put("medicineName", prescription.getMedicine().getName());
                medicineData.put("dosage", prescription.getDosage());
                medicineData.put("quantity", prescription.getQuantity());
                medicineData.put("instructions", prescription.getInstructions());
                medicineData.put("unitPrice", prescription.getUnitPrice());
                medicineData.put("totalPrice", prescription.getTotalPrice());
                medicineData.put("medicineUnit", prescription.getMedicine().getUnit());
                medicineDataList.add(medicineData);
            }
            System.out.println(medicineDataList);
            // Tạo JRBeanCollectionDataSource từ danh sách thuốc
            JRBeanCollectionDataSource medicineDataSource = new JRBeanCollectionDataSource(medicineDataList);

            String fileName = "Don_thuoc_" + booking.getFullName().replaceAll("\\s+", "_") + "_" + Calendar.getInstance().getTimeInMillis() + ".pdf";
            String fileNameFull = this.fileNameFullFolder + File.separator + fileName;

            File templateFile = new File(templateFolder, "prescription_report.jrxml");

            JasperReport jasperReport = JasperCompileManager.compileReport(templateFile.getAbsolutePath());
            System.out.println("medicineDataSource"+medicineDataSource);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, paramsReport, medicineDataSource);
            byte[] fileInBytes = JasperExportManager.exportReportToPdf(jasperPrint);
            System.out.println("fileInByte"+fileInBytes.length);
            FileUtils.writeByteArrayToFile(new File(fileNameFull), fileInBytes);
            return fileNameFull;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo file đơn thuốc PDF: " + e.getMessage());
        }
    }

    // Helper methods
    private String formatMoney(Long amount) {
        if (amount == null) return "0 VNĐ";
        return String.format("%,d VNĐ", amount);
    }

    private String formatMoneyForTemplate(Long amount) {
        if (amount == null) return "0";
        return String.format("%,d", amount);
    }

    private String getPaymentMethodText(String paymentStatus) {
        if (paymentStatus == null) return "Tiền mặt";
        switch (paymentStatus.toUpperCase()) {
            case "CASH":
                return "Tiền mặt";
            case "CARD":
                return "Thẻ";
            case "TRANSFER":
                return "Chuyển khoản";
            default:
                return "Tiền mặt";
        }
    }

    private int calculateAge(Date dob) {
        if (dob == null) return 0;
        return LocalDateTime.now().getYear() - dob.getYear();
    }
}

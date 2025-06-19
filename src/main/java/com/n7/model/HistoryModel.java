package com.n7.model;

import com.n7.entity.History;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryModel {

    private Long id;
    private Long bookingId;
    
    // Medical information
    private String medicalSummary;
    private String diagnosis;
    private String treatment;
    private String doctorNotes;
    
    // Timing information
    private LocalDateTime examinationDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Financial information
    private Long consultationFee;
    private Long medicineFee;
    private Long serviceFee;
    private Long totalAmount;
    
    // Patient information (from booking)
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String patientGender;
    private String patientAddress;
    
    // Doctor information (from booking)
    private String doctorName;
    private String majorName;
    
    // Legacy fields for backward compatibility
    private String medicine; // Formatted string for old system
    private String service;  // Formatted string for old system
    private LocalDateTime fromDate; // Alias for startTime
    private LocalDateTime toDate;   // Alias for endTime
    private String bhyt;
    private String address; // Alias for patientAddress
    private String name;    // Alias for patientName
    private String gender;  // Alias for patientGender
    private String admissionStatus;
    private String dischargeStatus;

    public static HistoryModel fromEntity(History history) {
        if (history == null) {
            return null;
        }

        HistoryModelBuilder builder = HistoryModel.builder()
                .id(history.getId())
                .bookingId(history.getBooking() != null ? history.getBooking().getId() : null)
                .medicalSummary(history.getMedicalSummary())
                .diagnosis(history.getDiagnosis())
                .treatment(history.getTreatment())
                .doctorNotes(history.getDoctorNotes())
                .examinationDate(history.getExaminationDate())
                .startTime(history.getStartTime())
                .endTime(history.getEndTime())
                .consultationFee(history.getConsultationFee())
                .medicineFee(history.getMedicineFee())
                .serviceFee(history.getServiceFee())
                .totalAmount(history.getTotalAmount());

        // Add booking information if available
        if (history.getBooking() != null) {
            builder.patientName(history.getBooking().getFullName())
                   .patientEmail(history.getBooking().getEmail())
                   .patientPhone(history.getBooking().getPhone())
                   .patientGender(history.getBooking().getGender() != null ? 
                                 history.getBooking().getGender().toString() : null)
                   .patientAddress(history.getBooking().getAddress());
            
            // Add doctor information if available
            if (history.getBooking().getUser() != null) {
                builder.doctorName(history.getBooking().getUser().getFullname());
                if (history.getBooking().getUser().getMajor() != null) {
                    builder.majorName(history.getBooking().getUser().getMajor().getName());
                }
            }
        }

        // Legacy field mappings for backward compatibility
        builder.fromDate(history.getStartTime())
               .toDate(history.getEndTime())
               .name(history.getBooking() != null ? history.getBooking().getFullName() : null)
               .gender(history.getBooking() != null && history.getBooking().getGender() != null ? 
                      history.getBooking().getGender().toString() : null)
               .address(history.getBooking() != null ? history.getBooking().getAddress() : null);

        return builder.build();
    }

    public static List<HistoryModel> fromEntityList(List<History> histories) {
        if (histories == null) {
            return null;
        }
        return histories.stream()
                .map(HistoryModel::fromEntity)
                .collect(Collectors.toList());
    }

    // Helper methods for backward compatibility
    public String getMedicine() {
        return this.medicine;
    }

    public String getService() {
        return this.service;
    }

    public Long getTotalMoney() {
        return this.totalAmount;
    }

    public String getFullName() {
        return this.patientName != null ? this.patientName : this.name;
    }

    // Getter methods for legacy API compatibility
    public LocalDateTime getFromDate() {
        return this.startTime != null ? this.startTime : this.fromDate;
    }

    public LocalDateTime getToDate() {
        return this.endTime != null ? this.endTime : this.toDate;
    }
}

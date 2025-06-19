package com.n7.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class History {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Medical information
    @Column(name = "medical_summary", columnDefinition = "TEXT")
    private String medicalSummary;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    // Timing
    @Column(name = "examination_date")
    private LocalDateTime examinationDate;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Financial
    @Column(name = "consultation_fee")
    private Long consultationFee;

    @Column(name = "medicine_fee")
    private Long medicineFee;

    @Column(name = "service_fee")
    private Long serviceFee;

    @Column(name = "total_amount")
    private Long totalAmount;

    // System fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "historyId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prescription> prescriptions;

    @OneToMany(mappedBy = "history", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceRequest> serviceRequests;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (examinationDate == null) {
            examinationDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public String getPatientName() {
        return booking != null ? booking.getFullName() : null;
    }

    public String getPatientGender() {
        return booking != null ? booking.getGender().toString() : null;
    }

    public String getPatientEmail() {
        return booking != null ? booking.getEmail() : null;
    }
}

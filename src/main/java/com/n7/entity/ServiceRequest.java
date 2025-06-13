package com.n7.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "service_requests")
public class ServiceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "service_id", nullable = false)
    private MedicalService medicalService;

    @ColumnDefault("'MEDICAL_SERVICE'")
    @Lob
    @Column(name = "service_type")
    private String serviceType;

    @ColumnDefault("'REQUESTED'")
    @Lob
    @Column(name = "status")
    private String status;

    @Lob
    @Column(name = "request_notes")
    private String requestNotes;

    @Lob
    @Column(name = "result_notes")
    private String resultNotes;

    @Column(name = "cost")
    private Long cost;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

}
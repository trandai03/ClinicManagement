package com.n7.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "doctor_schedule_hours")
public class DoctorScheduleHour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "hour_id", nullable = false)
    private Hour hour;

    @Column(name = "day_of_week")
    private Byte dayOfWeek;

    @Column(name = "specific_date")
    private LocalDate specificDate;

    @NotNull
    @ColumnDefault("'AVAILABLE'")
    @Lob
    @Column(name = "status", nullable = false)
    private String status;

    @Lob
    @Column(name = "note")
    private String note;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_date")
    private Instant createdDate;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_date")
    private Instant updatedDate;

}
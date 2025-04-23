package com.n7.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class History {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // format: id thuoc: soluong;id thuoc: soluong
    @Column
    private String medicine;

    // format: id;id
    @Column
    private String service;

    @Column
    private Date dob;

    @Column
    private Date fromDate;

    @Column
    private Date toDate;

    @Column
    private String bhyt;

    @Column
    private String address;

    @Column
    private String name;

    @Column
    private String gender;

    // tom tat benh tinh
    @Column
    private String medicalSummary;

    @Column
    private String nation;

    @Column
    private Long totalMoney;

    @Column(name = "booking_id")
    private Long bookingId;
}

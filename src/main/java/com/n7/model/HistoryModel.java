package com.n7.model;

import com.n7.entity.Booking;
import com.n7.entity.History;
import com.n7.service.impl.HistoryService;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryModel {



    private Long id;
    private String medicine;

    private Date fromDate;

    private Date toDate;

    private String bhyt;

    private String address;

    private String name;

    private String gender;

    private String admissionStatus;

    private String dischargeStatus;

    private String medicalSummary;

    private Long bookingId;

    public static HistoryModel fromEntity(History history){
        return HistoryModel.builder()
                .id(history.getId())
                .medicine(history.getMedicine())
                .fromDate(history.getFromDate())
                .toDate(history.getToDate())
                .bhyt(history.getBhyt())
                .address(history.getAddress())
                .name(history.getName())
                .medicalSummary(history.getMedicalSummary())
                .bookingId(history.getBookingId())
                .build();
    }

    public static List<HistoryModel> fromEntityList(List<History> histories){
        return histories.stream().map(HistoryModel::fromEntity).collect(Collectors.toList());
    }
}

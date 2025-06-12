package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsDTO {
    private Long hourId;
    private String hourName;
    private Long doctorId;
    private String doctorName;
    // Doctor rank information
    private Long doctorRankId;
    private String doctorRankName;
    private String doctorRankCode;
    private Long doctorRankBasePrice;
    private String doctorRankDescription;
    // getters & setters
}



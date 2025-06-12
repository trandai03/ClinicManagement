package com.n7.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorRankModel {
    private long id;
    private String name;
    private String description;
    private String code;
    private Long basePrice;
}
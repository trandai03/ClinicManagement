package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDTO {

    private String name;
    private Long quantity;
    private Long money;
    private String unit;
    private String description;




}

package com.n7.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class TimeSlotResponse {
    private Integer hourId;
    private String hourName;
    private Integer doctorId;
    private String doctorName;
    // constructors, getters, setters
}

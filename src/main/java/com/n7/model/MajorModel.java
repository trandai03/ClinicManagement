package com.n7.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MajorModel {
    private long id;
    private String name;
    private String description;
    private String image;
    private String workingHours;
    private String achievements;
    private String facilities;
    private String introduction;

}

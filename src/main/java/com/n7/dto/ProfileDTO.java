package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private Long id;

    private String fullName;

    private String phone;

    private String bhyt;

    private String address;

    private String gender;

    private String dob;
}

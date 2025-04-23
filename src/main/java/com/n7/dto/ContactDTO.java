package com.n7.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactDTO {
    private String name;
    private String dob;
    private String phone;
    private String email;
    private String note;
}

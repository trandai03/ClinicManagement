package com.n7.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
//    @NotBlank(message = "Username can not blank")
//    @Size(min = 5,max = 20,message = "Length of username must between 5 and 20")
    private String username;
//    @NotBlank(message = "Username can not blank")
//    @Size(min = 6,max = 20,message = "Length of password must between 6 and 20")
    private String password;
    private String gmail;
    private String phone;
    private String captcha;
}

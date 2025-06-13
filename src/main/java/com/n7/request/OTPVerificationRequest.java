package com.n7.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OTPVerificationRequest {
    @NotBlank(message = "OTP không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP phải có 6 chữ số")
    private String otp;

    private String email;

    private String phone;
}
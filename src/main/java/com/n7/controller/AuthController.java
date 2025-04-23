package com.n7.controller;

import com.n7.dto.UserDTO;
import com.n7.exception.ResourceNotFoundException;
import com.n7.model.UserModel;
import com.n7.request.LoginRequest;
import com.n7.request.RegisterRequest;
import com.n7.response.BaseResponse;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.JwtService;
import com.n7.service.impl.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try{
            System.out.println(loginRequest);
            Map<String,String> u = userService.login(loginRequest);
            return ResponseEntity.ok().body(new SuccessResponse<>("Login success",u));
        }catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse<>(e.getMessage()));
        }
    }

//    @PostMapping("register")
//    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO) {
//        try{
//            UserModel u = userService.register(userDTO);
//            return ResponseEntity.ok().body(u);
//        }
//        catch (ResourceNotFoundException e){
//            return ResponseEntity.badRequest().body(new ErrorResponse<>(e.getMessage()));
//        }
//        catch (Exception e) {
//            return ResponseEntity.badRequest().body(new ErrorResponse<>(e.getMessage()));
//        }
//    }
}

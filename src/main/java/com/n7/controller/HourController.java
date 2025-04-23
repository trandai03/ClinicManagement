package com.n7.controller;

import com.n7.entity.Hour;
import com.n7.repository.HourRepo;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class HourController {
    private final HourRepo hourRepo;
    @GetMapping("/hours")
    public ResponseEntity<?> getAllHours() {
        try{
            List<Hour> list = hourRepo.findAll();
            return ResponseEntity.ok().body(new SuccessResponse<>("get data success",list));
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>("Error!!" + ex.getMessage()));
        }
    }
}

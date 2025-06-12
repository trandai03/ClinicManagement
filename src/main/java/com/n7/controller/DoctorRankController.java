package com.n7.controller;

import com.n7.entity.DoctorRank;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.DoctorRankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor-ranks")
@RequiredArgsConstructor
public class DoctorRankController{
    private final DoctorRankService doctorRankService;

    @GetMapping
    public ResponseEntity<?> getAllDoctorRank(){
        List<DoctorRank> list = doctorRankService.findAll();
        return ResponseEntity.ok(new SuccessResponse<>("Get success",list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorRankById(@PathVariable Long id){
        return ResponseEntity.ok(doctorRankService.findById(id));
    }

    @PostMapping
    public ResponseEntity<?> createDoctorRank(@RequestBody DoctorRank doctorRank){
        return ResponseEntity.ok(doctorRankService.save(doctorRank));
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctorRank(@PathVariable Long id, @RequestBody DoctorRank doctorRank){
        return ResponseEntity.ok(doctorRankService.update(doctorRank));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctorRank(@PathVariable Long id){
        doctorRankService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

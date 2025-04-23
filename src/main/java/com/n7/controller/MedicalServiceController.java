package com.n7.controller;

import com.n7.dto.MedicalServiceDTO;
import com.n7.entity.MedicalService;
import com.n7.model.MedicalServiceModel;
import com.n7.service.impl.MedicalServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/medicalService")
public class MedicalServiceController {
    private final MedicalServiceService medicalServiceService;

    @GetMapping("")
    public List<MedicalServiceModel> getAllServices() {
        return MedicalServiceModel.fromEntityList(medicalServiceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalServiceModel> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(MedicalServiceModel.fromEntity(medicalServiceService.findById(id)));
    }


    @PostMapping("")
    public ResponseEntity<?> addService(@RequestBody MedicalServiceDTO medicalServiceDTO) {
        try {
            return ResponseEntity.ok(MedicalServiceModel.fromEntity(medicalServiceService.save(medicalServiceDTO)));
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error when saving service");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody MedicalServiceDTO medicalServiceDTO) {
        try {
            return ResponseEntity.ok(MedicalServiceModel.fromEntity(medicalServiceService.update(medicalServiceDTO,id)));
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error when updating service");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            medicalServiceService.delete(id);
            return ResponseEntity.ok().build();
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error when deleting service");
        }
    }
}

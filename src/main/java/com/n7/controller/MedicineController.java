package com.n7.controller;

import com.n7.dto.MedicineDTO;
import com.n7.entity.Medicine;
import com.n7.model.MedicineModel;
import com.n7.service.impl.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping("")
    public ResponseEntity<List<MedicineModel>> getAllMedicine() {
        return ResponseEntity.ok(MedicineModel.fromEntityList(medicineService.getAllMedicine()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineModel> getMedicineById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(MedicineModel.fromEntity(medicineService.getMedicineById(id)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<MedicineModel> addMedicine(@RequestBody MedicineDTO medicineDTO) {
        try {
            medicineService.saveMedicine(medicineDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineModel> updateMedicine(@PathVariable Long id, @RequestBody MedicineDTO medicineDTO) {
        try {
            medicineService.updateMedicine(medicineDTO, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MedicineModel> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

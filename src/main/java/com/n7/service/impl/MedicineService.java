package com.n7.service.impl;

import com.n7.constant.UnitMedicine;
import com.n7.dto.MedicineDTO;
import com.n7.entity.Medicine;
import com.n7.repository.MedicineRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {
    private final MedicineRepo medicineRepo;

    @Cacheable("medical")
    public List<Medicine> getAllMedicine() {
        return medicineRepo.findAll();
    }
    public Medicine getMedicineById(Long id) {
        return medicineRepo.findById(id).get();
    }

    private Medicine convertDTOtoEntity(MedicineDTO medicineDTO) {
        return Medicine.builder()
                .name(medicineDTO.getName())
                .quantity(medicineDTO.getQuantity())
                .money(medicineDTO.getMoney())
                .unit(UnitMedicine.valueOf(medicineDTO.getUnit()))
                .description(medicineDTO.getDescription())
                .build();
    }
    public void saveMedicine(MedicineDTO medicineDTO) {
        Medicine medicine = convertDTOtoEntity(medicineDTO);
        medicineRepo.save(medicine);
    }
    public void updateMedicine(MedicineDTO medicineDTO, Long id) {
        Medicine medicine = medicineRepo.findById(id).get();
        medicine.setName(medicineDTO.getName());
        medicine.setQuantity(medicineDTO.getQuantity());
        medicine.setMoney(medicineDTO.getMoney());
        medicine.setUnit(UnitMedicine.valueOf(medicineDTO.getUnit()));
        medicine.setDescription(medicineDTO.getDescription());
        medicineRepo.save(medicine);
    }

    public void deleteMedicine(Long id) {
        medicineRepo.deleteById(id);
    }

}

package com.n7.service.impl;

import com.n7.dto.MedicalServiceDTO;
import com.n7.entity.MedicalService;
import com.n7.model.MedicalServiceModel;
import com.n7.repository.MedicalServiceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalServiceService {
    private final MedicalServiceRepo medicalServiceRepo;

    @Cacheable("medicalService")
    public List<MedicalService> findAll() {
        return medicalServiceRepo.findAll();
    }

    public MedicalService findById(Long id) {
        return medicalServiceRepo.findById(id).get();
    }

    public MedicalService save(MedicalServiceDTO medicalServiceDTO) {
        return medicalServiceRepo.save(convertToEntity(medicalServiceDTO));
    }
    public MedicalService update(MedicalServiceDTO medicalServiceDTO, Long id) {
        MedicalService medicalService = medicalServiceRepo.findById(id).get();
        medicalService.setName(medicalServiceDTO.getName());
        medicalService.setMoney(medicalServiceDTO.getMoney());
        medicalService.setDescription(medicalServiceDTO.getDescription());
        return medicalServiceRepo.save(medicalService);
    }
    private MedicalService convertToEntity(MedicalServiceDTO medicalServiceDTO) {
        return MedicalService.builder()
                .name(medicalServiceDTO.getName())
                .money(medicalServiceDTO.getMoney())
                .description(medicalServiceDTO.getDescription())
                .build();
    }

    public void delete(Long id) {
        medicalServiceRepo.deleteById(id);
    }
}

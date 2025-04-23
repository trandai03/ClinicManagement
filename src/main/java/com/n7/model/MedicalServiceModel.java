package com.n7.model;

import com.n7.entity.MedicalService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicalServiceModel {
    private Long id;
    private String name;
    private Long money;
    private String description;

    public static MedicalServiceModel fromEntity(MedicalService medicalService) {
        return MedicalServiceModel.builder()
                .id(medicalService.getId())
                .name(medicalService.getName())
                .money(medicalService.getMoney())
                .description(medicalService.getDescription())
                .build();
    }

    public static List<MedicalServiceModel> fromEntityList(List<MedicalService> medicalServices) {
        return medicalServices.stream().map(MedicalServiceModel::fromEntity).collect(Collectors.toList());
    }
}

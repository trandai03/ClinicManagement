package com.n7.model;

import com.n7.entity.Medicine;
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
public class MedicineModel {
    private Long id;
    private String name;
    private Long quantity;
    private Long money;
    private String unit;
    private String description;

    public static MedicineModel fromEntity(Medicine medicine) {
        return MedicineModel.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .quantity(medicine.getQuantity())
                .money(medicine.getMoney())
                .unit(medicine.getUnit().name())
                .description(medicine.getDescription())
                .build();
    }

    public static List<MedicineModel> fromEntityList(List<Medicine> medicines) {
        return medicines.stream().map(MedicineModel::fromEntity).collect(Collectors.toList());
    }
}

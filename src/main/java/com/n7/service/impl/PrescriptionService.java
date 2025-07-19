package com.n7.service.impl;

import com.n7.entity.Medicine;
import com.n7.entity.Prescription;
import com.n7.exception.ResourceNotFoundException;
import com.n7.repository.MedicineRepo;
import com.n7.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepo medicineRepo;

    /**
     * Lấy tất cả đơn thuốc theo historyId
     */
    public List<Map<String, Object>> getPrescriptionsByHistoryId(Long historyId) {
        List<Prescription> prescriptions = prescriptionRepository.findByHistoryIdWithMedicine(historyId);
        return prescriptions.stream()
                .map(this::convertToDetailMap)
                .collect(Collectors.toList());
    }

    /**
     * Lấy đơn thuốc theo ID
     */
    public Map<String, Object> getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thuốc với ID: " + id));
        
        return convertToDetailMap(prescription);
    }

    /**
     * Tạo đơn thuốc mới
     */
    @Transactional
    public Map<String, Object> createPrescription(Long historyId, Long medicineId, Integer quantity, 
                                                  String dosage, String instructions) {
        // Kiểm tra medicine có tồn tại không
        Medicine medicine = medicineRepo.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuốc với ID: " + medicineId));

        // Tính toán giá
        long totalPrice = medicine.getMoney() * quantity;

        // Tạo prescription mới
        Prescription prescription = Prescription.builder()
                .historyId(historyId)
                .medicine(medicine)
                .quantity(quantity)
                .dosage(dosage)
                .instructions(instructions)
                .unitPrice(medicine.getMoney())
                .totalPrice(totalPrice)
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return convertToDetailMap(savedPrescription);
    }

    /**
     * Tạo nhiều đơn thuốc cùng lúc
     */
    @Transactional
    public List<Map<String, Object>> createPrescriptions(Long historyId, List<PrescriptionRequest> requests) {
        // Group các request theo medicineId và merge quantity
        Map<Long, PrescriptionRequest> mergedRequests = new HashMap<>();

        for (PrescriptionRequest request : requests) {
            Long medicineId = request.getMedicineId();

            if (mergedRequests.containsKey(medicineId)) {
                // Nếu đã tồn tại medicineId, cộng dồn quantity
                PrescriptionRequest existingRequest = mergedRequests.get(medicineId);
                existingRequest.setQuantity(existingRequest.getQuantity() + request.getQuantity());

                // Cập nhật dosage và instructions với giá trị mới nhất
                existingRequest.setDosage(request.getDosage());
                existingRequest.setInstructions(request.getInstructions());
            } else {
                // Nếu chưa tồn tại, thêm mới
                mergedRequests.put(medicineId, new PrescriptionRequest(
                        request.getMedicineId(),
                        request.getQuantity(),
                        request.getDosage(),
                        request.getInstructions()
                ));
            }
        }

        // Tạo prescriptions từ merged requests
        List<Prescription> prescriptions = mergedRequests.values().stream()
                .map(request -> createPrescriptionEntity(historyId, request))
                .collect(Collectors.toList());

        List<Prescription> savedPrescriptions = prescriptionRepository.saveAll(prescriptions);
        return savedPrescriptions.stream()
                .map(this::convertToDetailMap)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật đơn thuốc
     */
    @Transactional
    public Map<String, Object> updatePrescription(Long id, Integer quantity, String dosage, String instructions) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thuốc với ID: " + id));

        // Cập nhật thông tin
        if (quantity != null) {
            prescription.setQuantity(quantity);
            prescription.setTotalPrice(prescription.getUnitPrice() * quantity);
        }
        if (dosage != null) {
            prescription.setDosage(dosage);
        }
        if (instructions != null) {
            prescription.setInstructions(instructions);
        }

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return convertToDetailMap(updatedPrescription);
    }

    /**
     * Xóa đơn thuốc
     */
    @Transactional
    public void deletePrescription(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn thuốc với ID: " + id);
        }
        prescriptionRepository.deleteById(id);
    }

    /**
     * Xóa tất cả đơn thuốc theo historyId
     */
    @Transactional
    public void deletePrescriptionsByHistoryId(Long historyId) {
        prescriptionRepository.deleteByHistoryId(historyId);
    }

    /**
     * Tính tổng giá thuốc theo historyId
     */
    public Long calculateTotalMedicineFee(Long historyId) {
        List<Prescription> prescriptions = prescriptionRepository.findByHistoryId(historyId);
        return prescriptions.stream()
                .mapToLong(Prescription::getTotalPrice)
                .sum();
    }

    // Helper methods

    private Prescription createPrescriptionEntity(Long historyId, PrescriptionRequest request) {
        Medicine medicine = medicineRepo.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuốc với ID: " + request.getMedicineId()));

        long totalPrice = medicine.getMoney() * request.getQuantity();

        return Prescription.builder()
                .historyId(historyId)
                .medicine(medicine)
                .quantity(request.getQuantity())
                .dosage(request.getDosage())
                .instructions(request.getInstructions())
                .unitPrice(medicine.getMoney())
                .totalPrice(totalPrice)
                .build();
    }

    private Map<String, Object> convertToDetailMap(Prescription prescription) {
        Map<String, Object> details = new HashMap<>();
        details.put("id", prescription.getId());
        details.put("historyId", prescription.getHistoryId());
        details.put("medicineId", prescription.getMedicine().getId());
        details.put("medicineName", prescription.getMedicine().getName());
        details.put("medicineUnit", prescription.getMedicine().getUnit().name());
        details.put("quantity", prescription.getQuantity());
        details.put("dosage", prescription.getDosage());
        details.put("instructions", prescription.getInstructions());
        details.put("unitPrice", prescription.getUnitPrice());
        details.put("totalPrice", prescription.getTotalPrice());
        details.put("createdAt", prescription.getCreatedAt());
        details.put("updatedAt", prescription.getUpdatedAt());
        return details;
    }

    // Inner class for request data
    public static class PrescriptionRequest {
        private Long medicineId;
        private Integer quantity;
        private String dosage;
        private String instructions;

        // Constructors
        public PrescriptionRequest() {}

        public PrescriptionRequest(Long medicineId, Integer quantity, String dosage, String instructions) {
            this.medicineId = medicineId;
            this.quantity = quantity;
            this.dosage = dosage;
            this.instructions = instructions;
        }

        // Getters and Setters
        public Long getMedicineId() { return medicineId; }
        public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }

        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
    }
}

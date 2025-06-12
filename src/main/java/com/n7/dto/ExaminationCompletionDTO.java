package com.n7.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationCompletionDTO {
    private Long bookingId;
    private List<MedicineData> medicines;
    private List<ServiceData> services;
    private Long totalAmount;
    private String paymentMethod;
    private String notes;

    // Inner classes for data
    public static class MedicineData {
        private Long medicineId;
        private Integer quantity;
        private String dosage;
        private String instructions;

        // Getters and setters
        public Long getMedicineId() {
            return medicineId;
        }

        public void setMedicineId(Long medicineId) {
            this.medicineId = medicineId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }
    }

    public static class ServiceData {
        private Long serviceId;
        private java.math.BigDecimal cost;
        private String requestNotes;

        // Getters and setters
        public Long getServiceId() {
            return serviceId;
        }

        public void setServiceId(Long serviceId) {
            this.serviceId = serviceId;
        }

        public java.math.BigDecimal getCost() {
            return cost;
        }

        public void setCost(java.math.BigDecimal cost) {
            this.cost = cost;
        }

        public String getRequestNotes() {
            return requestNotes;
        }

        public void setRequestNotes(String requestNotes) {
            this.requestNotes = requestNotes;
        }
    }


}
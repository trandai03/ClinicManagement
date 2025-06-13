package com.n7.model;

import com.n7.entity.ServiceRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestModel {
    private Long id;
    private Long bookingId;
    private Long medicalServiceId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String requestNotes;
    private String resultNotes;
    private Long cost;
    private String serviceName;

    public static ServiceRequestModel fromEntityToModal(ServiceRequest serviceRequest){
        return new ServiceRequestModel().builder()
                .bookingId(serviceRequest.getBooking().getId())
                .medicalServiceId(serviceRequest.getMedicalService().getId())
                .serviceName(serviceRequest.getMedicalService().getName())
                .status(serviceRequest.getStatus())
                .requestNotes(serviceRequest.getRequestNotes())
                .resultNotes(serviceRequest.getResultNotes())
                .createdAt(serviceRequest.getRequestedAt())
                .updatedAt(serviceRequest.getCompletedAt())
                .cost(serviceRequest.getCost())
                .build();
    }

    public static List<ServiceRequestModel> fromEntityToModals(List<ServiceRequest> serviceRequests){
        return serviceRequests.stream()
                .map(ServiceRequestModel::fromEntityToModal)
                .collect(Collectors.toList());
    }

    
}

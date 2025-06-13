package com.n7.service.impl;

import com.n7.dto.ServiceRequestDTO;
import com.n7.entity.Booking;
import com.n7.entity.ServiceRequest;
import com.n7.model.ServiceRequestModel;
import com.n7.repository.BookingRepo;
import com.n7.repository.MedicalServiceRepo;
import com.n7.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {
    private final ServiceRequestRepository serviceRequestRepository;
    private final BookingRepo bookingRepo;
    private final MedicalServiceRepo medicalServiceRepo;

    public List<ServiceRequestModel> createServiceRequest(Long bookingId,List<ServiceRequestDTO> serviceRequestDTOs) {
        Booking booking =bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        List<ServiceRequest> serviceRequests = new ArrayList<>();
        for(ServiceRequestDTO serviceRequestDTO : serviceRequestDTOs) {
            ServiceRequest serviceRequest = new ServiceRequest();
            serviceRequest.setMedicalService(medicalServiceRepo.findById(serviceRequestDTO.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Medical service not found")));
            serviceRequest.setBooking(booking);
            serviceRequest.setRequestNotes(serviceRequestDTO.getRequestNotes());
            serviceRequest.setResultNotes(serviceRequestDTO.getResultNotes());
            serviceRequest.setCost(serviceRequestDTO.getCost());
            serviceRequest.setRequestedAt(LocalDateTime.now());
            serviceRequests.add(serviceRequestRepository.save(serviceRequest));

        }
        return ServiceRequestModel.fromEntityToModals(serviceRequests);
    }

    public ServiceRequestModel getServiceRequestById(Long id) {
        return ServiceRequestModel.fromEntityToModal(serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found")));
    }

    public List<ServiceRequestModel> getAllServiceRequestsByBookingId(Long bookingId){
        return ServiceRequestModel.fromEntityToModals(serviceRequestRepository.findByBookingId(bookingId));
    }

    public ServiceRequestModel updateServiceRequest( Long serviceRequestId, ServiceRequestDTO serviceRequestDTO){
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        serviceRequest.setRequestNotes(serviceRequestDTO.getRequestNotes());
        serviceRequest.setResultNotes(serviceRequestDTO.getResultNotes());
        serviceRequest.setCost(serviceRequestDTO.getCost());
        return ServiceRequestModel.fromEntityToModal(serviceRequestRepository.save(serviceRequest));
    }

    public void deleteServiceRequest(Long serviceRequestId){
        serviceRequestRepository.deleteById(serviceRequestId);
    }
}

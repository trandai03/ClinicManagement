package com.n7.controller;

import com.n7.dto.ServiceRequestDTO;
import com.n7.model.ServiceRequestModel;
import com.n7.service.impl.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-request")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @GetMapping("/{bookingId}")
    public List<ServiceRequestModel> getAllServiceRequestsByBookingId(@PathVariable Long bookingId){
        return serviceRequestService.getAllServiceRequestsByBookingId(bookingId);
    }

    @PostMapping("/{bookingId}")
    public List<ServiceRequestModel> createServiceRequest(@PathVariable Long bookingId, @RequestBody List<ServiceRequestDTO> serviceRequestDTO){
        return serviceRequestService.createServiceRequest(bookingId,serviceRequestDTO);
    }

    @PutMapping("/{serviceRequestId}")
    public ServiceRequestModel updateServiceRequest(@PathVariable Long serviceRequestId, @RequestBody ServiceRequestDTO serviceRequestDTO){
        return serviceRequestService.updateServiceRequest( serviceRequestId, serviceRequestDTO);
    }

    @DeleteMapping("/{serviceRequestId}")
    public void deleteServiceRequest(@PathVariable Long serviceRequestId){
        serviceRequestService.deleteServiceRequest(serviceRequestId);
    }

}

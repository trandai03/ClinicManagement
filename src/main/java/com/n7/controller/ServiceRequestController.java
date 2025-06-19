package com.n7.controller;

import com.n7.dto.ServiceRequestDTO;
import com.n7.model.ServiceRequestModel;
import com.n7.service.impl.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-request")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @GetMapping("/{bookingId}")
    public ResponseEntity<List<ServiceRequestModel>> getAllServiceRequestsByBookingId(@PathVariable Long bookingId) {
        try {
            List<ServiceRequestModel> serviceRequests = serviceRequestService.getAllServiceRequestsByBookingId(bookingId);
            return ResponseEntity.ok(serviceRequests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<List<ServiceRequestModel>> createServiceRequest(
            @PathVariable Long bookingId, 
            @RequestBody List<ServiceRequestDTO> serviceRequestDTO) {
        try {
            List<ServiceRequestModel> serviceRequests = serviceRequestService.createServiceRequest(bookingId, serviceRequestDTO);
            return ResponseEntity.ok(serviceRequests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{serviceRequestId}")
    public ResponseEntity<ServiceRequestModel> updateServiceRequest(
            @PathVariable Long serviceRequestId, 
            @RequestBody ServiceRequestDTO serviceRequestDTO) {
        try {
            ServiceRequestModel updatedRequest = serviceRequestService.updateServiceRequest(serviceRequestId, serviceRequestDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{serviceRequestId}")
    public ResponseEntity<Void> deleteServiceRequest(@PathVariable Long serviceRequestId) {
        try {
            serviceRequestService.deleteServiceRequest(serviceRequestId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/detail/{serviceRequestId}")
    public ResponseEntity<ServiceRequestModel> getServiceRequestById(@PathVariable Long serviceRequestId) {
        try {
            ServiceRequestModel serviceRequest = serviceRequestService.getServiceRequestById(serviceRequestId);
            return ResponseEntity.ok(serviceRequest);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{serviceRequestId}/complete")
    public ResponseEntity<ServiceRequestModel> completeServiceRequest(
            @PathVariable Long serviceRequestId,
            @RequestParam(required = false) String resultNotes) {
        try {
            ServiceRequestModel completedRequest = serviceRequestService.completeServiceRequest(serviceRequestId, resultNotes);
            return ResponseEntity.ok(completedRequest);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pending/{doctorId}")
    public ResponseEntity<List<ServiceRequestModel>> getPendingServiceRequests(@PathVariable Long doctorId) {
        try {
            List<ServiceRequestModel> pendingRequests = serviceRequestService.getPendingServiceRequests(doctorId);
            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/cost/{bookingId}")
    public ResponseEntity<Long> getTotalServiceCost(@PathVariable Long bookingId) {
        try {
            Long totalCost = serviceRequestService.getTotalServiceCost(bookingId);
            return ResponseEntity.ok(totalCost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update-multiple")
    public ResponseEntity<List<ServiceRequestModel>> updateMultipleServiceRequests(
            @RequestBody List<ServiceRequestDTO> updates) {
        try {
            List<ServiceRequestModel> updatedRequests = serviceRequestService.updateMultipleServiceRequests(updates);
            return ResponseEntity.ok(updatedRequests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/history/{historyId}")
    public ResponseEntity<List<ServiceRequestModel>> getServiceRequestsByHistoryId(@PathVariable Long historyId) {
        try {
            List<ServiceRequestModel> serviceRequests = serviceRequestService.getServiceRequestsByHistoryId(historyId);
            return ResponseEntity.ok(serviceRequests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

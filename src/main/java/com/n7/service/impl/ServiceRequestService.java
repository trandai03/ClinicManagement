package com.n7.service.impl;

import com.n7.constant.Status;
import com.n7.dto.ServiceRequestDTO;
import com.n7.entity.Booking;
import com.n7.entity.History;
import com.n7.entity.ServiceRequest;
import com.n7.model.ServiceRequestModel;
import com.n7.repository.BookingRepo;
import com.n7.repository.HistoryRepo;
import com.n7.repository.MedicalServiceRepo;
import com.n7.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {
    private final ServiceRequestRepository serviceRequestRepository;
    private final BookingRepo bookingRepo;
    private final MedicalServiceRepo medicalServiceRepo;
    private final BookingService bookingService;
    private final HistoryRepo historyRepo;

    @Transactional
    public List<ServiceRequestModel> createServiceRequest(Long bookingId, List<ServiceRequestDTO> serviceRequestDTOs) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        History history = historyRepo.findByBookingId(bookingId).orElseThrow(() -> new RuntimeException("History not found"));
        List<ServiceRequest> serviceRequests = new ArrayList<>();
        for(ServiceRequestDTO serviceRequestDTO : serviceRequestDTOs) {
            ServiceRequest serviceRequest = ServiceRequest.builder()
                    .booking(booking)
                    .history(history)
                    .medicalService(medicalServiceRepo.findById(serviceRequestDTO.getServiceId())
                            .orElseThrow(() -> new RuntimeException("Medical service not found")))
                    .serviceType("MEDICAL_SERVICE")
                    .status("COMPLETED")
                    .requestNotes(serviceRequestDTO.getRequestNotes())
                    .resultNotes(serviceRequestDTO.getResultNotes())
                    .cost(serviceRequestDTO.getCost())
                    .requestedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();
            serviceRequests.add(serviceRequestRepository.save(fakeData(serviceRequest)));

        }

        // Cập nhật booking status thành AWAITING_RESULTS nếu có service requests
//        if (!serviceRequests.isEmpty() && booking.getStatus() == Status.IN_PROGRESS) {
//            bookingService.updateBooking(booking, Status.AWAITING_RESULTS);
//        }
        booking.setServiceRequests(serviceRequests);
        bookingRepo.save(booking);
        return ServiceRequestModel.fromEntityToModals(serviceRequests);
    }

    public ServiceRequestModel getServiceRequestById(Long id) {
        return ServiceRequestModel.fromEntityToModal(serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service request not found")));
    }

    public List<ServiceRequestModel> getAllServiceRequestsByBookingId(Long bookingId) {
        return ServiceRequestModel.fromEntityToModals(serviceRequestRepository.findByBooking_Id(bookingId));
    }

    @Transactional
    public ServiceRequestModel updateServiceRequest(Long serviceRequestId, ServiceRequestDTO serviceRequestDTO) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        
        serviceRequest.setRequestNotes(serviceRequestDTO.getRequestNotes());
        serviceRequest.setResultNotes(serviceRequestDTO.getResultNotes());
        serviceRequest.setCost(serviceRequestDTO.getCost());
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        
        return ServiceRequestModel.fromEntityToModal(serviceRequestRepository.save(serviceRequest));
    }

    @Transactional
    public ServiceRequestModel completeServiceRequest(Long serviceRequestId, String resultNotes) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        
        serviceRequest.setStatus("COMPLETED");
        serviceRequest.setResultNotes(resultNotes);
        serviceRequest.setCompletedAt(LocalDateTime.now());
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        
        ServiceRequest savedRequest = serviceRequestRepository.save(serviceRequest);

        // Kiểm tra nếu tất cả service requests của booking đã hoàn thành
        checkAndUpdateBookingStatus(serviceRequest.getBooking().getId());
        
        return ServiceRequestModel.fromEntityToModal(savedRequest);
    }

    @Transactional
    public void deleteServiceRequest(Long serviceRequestId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));
        
        Long bookingId = serviceRequest.getBooking().getId();
        serviceRequestRepository.deleteById(serviceRequestId);
        
        // Kiểm tra lại trạng thái booking sau khi xóa service request
        checkAndUpdateBookingStatus(bookingId);
    }

    /**
     * Kiểm tra và cập nhật trạng thái booking dựa trên service requests
     */
    private void checkAndUpdateBookingStatus(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        List<ServiceRequest> serviceRequests = serviceRequestRepository.findByBooking_Id(bookingId);
        
        if (serviceRequests.isEmpty()) {
            // Không còn service request nào, có thể chuyển về IN_PROGRESS
            if (booking.getStatus() == Status.AWAITING_RESULTS) {
                booking.setStatus(Status.IN_PROGRESS);
                bookingRepo.save(booking);
            }
        } else {
            // Kiểm tra xem tất cả service requests đã hoàn thành chưa
            boolean allCompleted = serviceRequests.stream()
                    .allMatch(sr -> "COMPLETED".equals(sr.getStatus()));
            
            if (allCompleted && booking.getStatus() == Status.AWAITING_RESULTS) {
                // Tất cả service requests đã hoàn thành, có thể tiến hành hoàn tất khám
                // Không tự động chuyển thành SUCCESS, để bác sĩ quyết định
                // booking.setStatus(Status.IN_PROGRESS);
                // bookingRepo.save(booking);
            }
        }
    }

    /**
     * Lấy các service requests đang chờ kết quả
     */
    public List<ServiceRequestModel> getPendingServiceRequests(Long doctorId) {
        // Lấy các booking của doctor có service requests chưa hoàn thành
        List<ServiceRequest> pendingRequests = serviceRequestRepository
                .findByBooking_User_IdAndStatusNot(doctorId, "COMPLETED");
        
        return ServiceRequestModel.fromEntityToModals(pendingRequests);
    }

    /**
     * Lấy tổng cost của các service requests cho một booking
     */
    public Long getTotalServiceCost(Long bookingId) {
        List<ServiceRequest> serviceRequests = serviceRequestRepository.findByBooking_Id(bookingId);
        return serviceRequests.stream()
                .mapToLong(sr -> sr.getCost() != null ? sr.getCost() : 0L)
                .sum();
    }

    /**
     * Cập nhật nhiều service requests cùng lúc
     */
    @Transactional
    public List<ServiceRequestModel> updateMultipleServiceRequests(List<ServiceRequestDTO> updates) {
        List<ServiceRequestModel> results = new ArrayList<>();
        
        for (ServiceRequestDTO update : updates) {
            if (update.getServiceId() != null) { // Sử dụng serviceId như ID của service request
                ServiceRequestModel updated = updateServiceRequest(update.getServiceId(), update);
                results.add(updated);
            }
        }
        
        return results;
    }

    /**
     * Lấy service requests theo history ID
     */
    public List<ServiceRequestModel> getServiceRequestsByHistoryId(Long historyId) {
        List<ServiceRequest> requests = serviceRequestRepository.findByHistoryId(historyId);
        return ServiceRequestModel.fromEntityToModals(requests);
    }

    private ServiceRequest fakeData(ServiceRequest serviceRequest){
        if(serviceRequest.getMedicalService().getId() ==10){
            serviceRequest.setResultFile("https://res.cloudinary.com/dmuhayimh/image/upload/v1750219280/K%E1%BA%BET_QU%E1%BA%A2_CH%E1%BB%A4P_X_p0akna.pdf");
            serviceRequest.setResultImages("https://res.cloudinary.com/dmuhayimh/image/upload/v1750219518/chup-ct-phoi-4_1_ho5c5s.jpg");
        }
        if(serviceRequest.getMedicalService().getId() ==4){
            serviceRequest.setResultFile("https://res.cloudinary.com/dmuhayimh/image/upload/v1750219235/K%E1%BA%BET_QU%E1%BA%A2_X%C3%89T_NGHI%E1%BB%86M_M%C3%81U_nh8wrc.pdf");

        }
        return serviceRequest;
    }
}

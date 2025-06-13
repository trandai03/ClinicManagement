package com.n7.service.impl;

import com.n7.constant.Status;

import com.n7.dto.ExaminationCompletionDTO;
import com.n7.dto.ExaminationStartDTO;
import com.n7.entity.*;
import com.n7.exception.ResourceNotFoundException;
import com.n7.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExaminationService {

    private final BookingRepo bookingRepo;
    private final HistoryRepo historyRepo;
    private final ServiceRequestRepository serviceRequestRepo;
    private final MedicineRepo medicineRepo;
    private final MedicalServiceRepo medicalServiceRepo;

    @Transactional
    public void updateBookingStatus(Long bookingId, Status status) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(status);

        // Set timing based on status
        switch (status) {
            case IN_PROGRESS:
                booking.setStartTime(LocalDateTime.now());
                break;
            case SUCCESS:
                booking.setEndTime(LocalDateTime.now());
                booking.setPaymentStatus("PAID");
                booking.setPaidAt(LocalDateTime.now());
                break;
        }

        bookingRepo.save(booking);
    }

    @Transactional
    public void startExamination(Long bookingId, ExaminationStartDTO startData) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Update booking
        booking.setStatus(Status.IN_PROGRESS);
        booking.setStartTime(LocalDateTime.now());
        booking.setRoomNumber(startData.getRoomNumber());
        booking.setNote(startData.getInitialSymptoms() + "\n" + startData.getDoctorNotes());

        bookingRepo.save(booking);
    }

    @Transactional
    public void completeExamination(ExaminationCompletionDTO completionData) {
        Booking booking = bookingRepo.findById(completionData.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // 1. Update booking status
        booking.setStatus(Status.SUCCESS);
        booking.setEndTime(LocalDateTime.now());
        booking.setTotalAmount(completionData.getTotalAmount());
        booking.setPaymentStatus("PAID");
        booking.setPaymentMethod(completionData.getPaymentMethod());
        booking.setPaidAt(LocalDateTime.now());
        bookingRepo.save(booking);

        // 2. Create service requests if any
        if (completionData.getServices() != null && !completionData.getServices().isEmpty()) {
            completionData.getServices().forEach(serviceData -> {
                ServiceRequest serviceRequest = new ServiceRequest();
                serviceRequest.setBooking(booking);
                serviceRequest.setMedicalService(medicalServiceRepo.findById(serviceData.getServiceId()).get());
                serviceRequest.setServiceType("MEDICAL_SERVICE");
                serviceRequest.setStatus("COMPLETED"); // Assuming completed immediately
                serviceRequest.setCost(serviceData.getCost());
                serviceRequest.setRequestNotes(serviceData.getRequestNotes());
                serviceRequestRepo.save(serviceRequest);
            });
        }

        // 3. Create history record (using existing table)
        History history = new History();
        history.setBookingId(booking.getId());
        history.setName(booking.getFullName());
        history.setDob(booking.getDob());
        history.setGender(booking.getGender().toString());
        history.setAddress(booking.getAddress());

        // Format medicines string (existing format: "id:quantity,id:quantity")
        if (completionData.getMedicines() != null && !completionData.getMedicines().isEmpty()) {
            StringBuilder medicineStr = new StringBuilder();
            completionData.getMedicines().forEach(med -> {
                medicineStr.append(med.getMedicineId())
                        .append(":")
                        .append(med.getQuantity())
                        .append(",");
            });
            history.setMedicine(medicineStr.toString());
        }

        // Format services string (existing format: "id,id,id")
        if (completionData.getServices() != null && !completionData.getServices().isEmpty()) {
            StringBuilder serviceStr = new StringBuilder();
            completionData.getServices().forEach(srv -> {
                serviceStr.append(srv.getServiceId()).append(",");
            });
            history.setService(serviceStr.toString());
        }

        history.setTotalMoney(completionData.getTotalAmount().longValue());
        history.setMedicalSummary(completionData.getNotes());
        history.setFromDate(booking.getStartTime());
        history.setToDate(booking.getEndTime());

        historyRepo.save(history);
    }

    // Additional helper methods
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepo.findById(id);
    }
}




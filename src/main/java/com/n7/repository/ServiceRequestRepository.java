package com.n7.repository;

import com.n7.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.booking.id = :bookingId")
    List<ServiceRequest> findByBookingId(Long bookingId);
}
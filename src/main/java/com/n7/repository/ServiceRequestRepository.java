package com.n7.repository;

import com.n7.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
//    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.booking.id = :bookingId")
//    List<ServiceRequest> findByBookingId(@Param("bookingId") Long bookingId);

    List<ServiceRequest> findByBooking_Id(Long bookingId);
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.history.id = :historyId")
    List<ServiceRequest> findByHistoryId(@Param("historyId") Long historyId);
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.booking.user.id = :doctorId AND sr.status != :status")
    List<ServiceRequest> findByBooking_User_IdAndStatusNot(@Param("doctorId") Long doctorId, @Param("status") String status);
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.booking.user.id = :doctorId AND sr.status = :status")
    List<ServiceRequest> findByBooking_User_IdAndStatus(@Param("doctorId") Long doctorId, @Param("status") String status);
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.status = :status")
    List<ServiceRequest> findByStatus(@Param("status") String status);
    
    @Query("SELECT COUNT(sr) FROM ServiceRequest sr WHERE sr.booking.id = :bookingId AND sr.status = 'COMPLETED'")
    Long countCompletedByBookingId(@Param("bookingId") Long bookingId);
    
    @Query("SELECT COUNT(sr) FROM ServiceRequest sr WHERE sr.booking.id = :bookingId")
    Long countByBookingId(@Param("bookingId") Long bookingId);
    
    @Query("SELECT SUM(sr.cost) FROM ServiceRequest sr WHERE sr.booking.id = :bookingId")
    Long sumCostByBookingId(@Param("bookingId") Long bookingId);
    
    @Query("SELECT SUM(sr.cost) FROM ServiceRequest sr WHERE sr.history.id = :historyId")
    Long sumCostByHistoryId(@Param("historyId") Long historyId);

}
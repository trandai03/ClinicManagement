package com.n7.repository;

import com.n7.constant.Status;
import com.n7.entity.Booking;
import com.n7.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepo extends JpaRepository<Booking, Long> {
    @Query("SELECT u FROM Booking u " +
            "WHERE (:id IS NULL OR u.user.id = :id) " +
            "AND (:status IS NULL OR u.status = :status)" +
            "AND (:email IS NULL OR u.email = :email)" +
            "AND (:start IS NULL OR u.date >= :start) " +
            "AND (:end IS NULL OR u.date <= :end) " +
            "order by u.date")
    List<Booking> findByCustom(Long id, Status status, String email, Date start, Date end);

    @Query("SELECT b FROM Booking b " +
            "WHERE b.idHour = :idHour " +
            "AND b.user.id = :idUser " +
            "AND b.status = :status " +
            "AND DATE(b.date) = DATE(:date)")
    List<Booking> checkLich(Long idHour, Long idUser, Status status, Date date);

    @Query("SELECT u FROM Booking u " +
            "WHERE (:status IS NULL OR u.status = :status)" +
            "AND u.date between :start and :end")
    List<Booking> scanBooking(Date start, Date end, Status status);

    @Query("SELECT b FROM Booking b " +
           "WHERE b.status = :status " +
           "AND DATE(b.date) >= DATE(:startDate) " +
           "AND DATE(b.date) <= DATE(:endDate) " +
           "ORDER BY b.date")
    List<Booking> findUpcomingBookings(Status status, Date startDate, Date endDate);

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.status = :status " +
           "AND (:doctorId IS NULL OR b.user.id = :doctorId) " +
           "AND (:start IS NULL OR b.date >= :start) " )
    Integer countBookingByStatus(Status status, Long doctorId,Date start);

    @Query("SELECT b.status, COUNT(b) FROM Booking b " +
            "WHERE (:doctorId IS NULL OR b.user.id = :doctorId) " +
            "AND (:status IS NULL OR b.status >= :status) " +
            "AND (:start IS NULL OR b.date >= :start) " +
            "GROUP BY b.status")
    List<Object[]> countBookingsGroupedByStatus(@Param("doctorId") Long doctorId, @Param("start") Date start,@Param("status") Status status);
    @Query("SELECT b.user.id, COUNT(b) FROM Booking b " +
            "WHERE (:status IS NULL OR b.status = :status) " +
            "AND (:start IS NULL OR b.date >= :start) " +
            "AND (:end IS NULL OR b.date <= :end) " +
            "GROUP BY b.user.id")
    List<Object[]> countBookingsGroupedByDoctor(@Param("start") Date start, @Param("status") Status status, @Param("end") Date end);

}

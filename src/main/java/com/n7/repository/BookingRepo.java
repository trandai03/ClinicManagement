package com.n7.repository;

import com.n7.constant.Status;
import com.n7.entity.Booking;
import com.n7.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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

}

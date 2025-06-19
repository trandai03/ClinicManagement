package com.n7.repository;

import com.n7.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryRepo extends JpaRepository<History, Long> {
    Optional<History> findByBookingId(long bookingId);

    @Query("select h from History h where h.booking.user.id=:doctorId")
    List<History> findByDoctor(@Param("doctorId") Long doctorId);
}

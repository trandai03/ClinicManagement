package com.n7.repository;

import com.n7.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HistoryRepo extends JpaRepository<History, Long> {
    Optional<History> findByBookingId(long bookingId);
}

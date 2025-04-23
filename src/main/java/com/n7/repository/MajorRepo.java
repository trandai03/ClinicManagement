package com.n7.repository;

import com.n7.entity.Booking;
import com.n7.entity.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MajorRepo extends JpaRepository<Major, Long> {
    Major findByName(String name);
}
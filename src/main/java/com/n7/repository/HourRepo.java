package com.n7.repository;

import com.n7.entity.Hour;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HourRepo extends JpaRepository<Hour, Long> {
}

package com.n7.repository;

import com.n7.entity.Hour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HourRepo extends JpaRepository<Hour, Long> {
    List<Hour> findBySession(String session);
}

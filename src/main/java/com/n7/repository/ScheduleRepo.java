package com.n7.repository;

import com.n7.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface ScheduleRepo extends JpaRepository<Schedule, Long> {
    Optional<Schedule> findByListUser_Id(Long id);

    Optional<Schedule> findByHour_IdAndDate(Long id, Date date);
}

package com.n7.repository;

import com.n7.entity.DoctorRank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorRankRepository extends JpaRepository<DoctorRank, Long> {
  List<DoctorRank> findByName(String name);
}
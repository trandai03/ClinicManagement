package com.n7.repository;

import com.n7.entity.MedicalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalServiceRepo extends JpaRepository<MedicalService, Long> {
}

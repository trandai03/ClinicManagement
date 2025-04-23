package com.n7.repository;

import com.n7.entity.TypeMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeMedicineRepo extends JpaRepository<TypeMedicine, Long> {
}

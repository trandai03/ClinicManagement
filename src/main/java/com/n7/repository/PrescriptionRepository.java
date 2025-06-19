package com.n7.repository;

import com.n7.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByHistoryId(Long historyId);

    @Query("SELECT p FROM Prescription p WHERE p.historyId = :historyId ORDER BY p.createdAt")
    List<Prescription> findByHistoryIdOrderByCreatedAt(@Param("historyId") Long historyId);

    @Query("SELECT p FROM Prescription p JOIN p.medicine m WHERE p.historyId = :historyId")
    List<Prescription> findByHistoryIdWithMedicine(@Param("historyId") Long historyId);

    void deleteByHistoryId(Long historyId);
}
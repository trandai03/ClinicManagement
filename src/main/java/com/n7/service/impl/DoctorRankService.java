package com.n7.service.impl;

import com.n7.entity.DoctorRank;
import com.n7.repository.DoctorRankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorRankService {
    private final DoctorRankRepository doctorRankRepository;

    public List<DoctorRank> findAll() {
        return doctorRankRepository.findAll();
    }

    public DoctorRank findById(Long id) {
        return doctorRankRepository.findById(id).orElse(null);
    }

    public DoctorRank save(DoctorRank doctorRank) {
        return doctorRankRepository.save(doctorRank);
    }

    public void deleteById(Long id) {
        doctorRankRepository.deleteById(id);
    }

    public DoctorRank update(DoctorRank doctorRank) {
        return doctorRankRepository.save(doctorRank);
    }

    public List<DoctorRank> findByName(String name) {
        return doctorRankRepository.findByName(name);
    }
    
}

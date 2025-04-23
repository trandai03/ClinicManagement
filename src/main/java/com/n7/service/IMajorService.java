package com.n7.service;

import com.n7.dto.MajorDTO;
import com.n7.entity.Major;
import com.n7.model.MajorModel;

import java.util.List;
import java.util.Optional;

public interface IMajorService {
    List<MajorModel> getAll();
    Optional<Major> findById(long id);
    boolean checkNameMajor(String name);
    boolean saveMajor(MajorDTO majorDTO, Long id, String image, String idImage);
    void updateMajor(MajorDTO majorDTO, Long id, String image, String idImage);
    void deleteMajor(Long id);
    void convertDTOtoEntity(MajorDTO majorDTO, Major major);
    MajorModel convertEntityToModel(Major major);
}

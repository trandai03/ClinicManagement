package com.n7.service.impl;

import com.n7.dto.ProfileDTO;
import com.n7.entity.Profile;
import com.n7.repository.ProfileRepo;
import com.n7.utils.ConvertTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepo profileRepo;

    public Profile getProfile(Long id) {
        return profileRepo.findById(id).get();
    }

    public Profile saveProfile(ProfileDTO profile) {
        Profile profileToSave = profileRepo.findById(profile.getId()).get();
        Date dob = ConvertTimeUtils.stringToDate(profile.getDob());
        log.info(dob.toString());
        profileToSave.setDob(dob);
        profileToSave.setId(profile.getId());
        profileToSave.setBhyt(profile.getBhyt());
        profileToSave.setPhone(profile.getPhone());
        profileToSave.setGender(profile.getGender());
        profileToSave.setFullName(profile.getFullName());
        profileToSave.setAddress(profile.getAddress());
        return profileRepo.save(profileToSave);
    }

}

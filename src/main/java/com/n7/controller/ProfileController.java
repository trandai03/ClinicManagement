package com.n7.controller;

import com.n7.dto.ProfileDTO;
import com.n7.entity.Profile;
import com.n7.service.impl.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/")
public class ProfileController {
    private final ProfileService profileService;

    @PostMapping("profile")
    public ResponseEntity<Profile> addProfile(@RequestBody ProfileDTO profile) {
        try {
            Profile savedProfile = profileService.saveProfile(profile);
            return ResponseEntity.ok(savedProfile);
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

package com.civicpulse.citizen.controller;

import com.civicpulse.citizen.domain.CitizenProfile;
import com.civicpulse.citizen.repository.CitizenProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/citizens")
public class CitizenController {

    @Autowired
    private CitizenProfileRepository profileRepository;

    @PostMapping("/profile")
    public ResponseEntity<?> createOrUpdateProfile(@RequestBody CitizenProfile profile) {
        if (profile.getUserEmail() == null || profile.getFullName() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and full name are required."));
        }
        
        // Lowercase the email to match case-insensitive design rules
        profile.setUserEmail(profile.getUserEmail().trim().toLowerCase());

        Optional<CitizenProfile> existingOpt = profileRepository.findByUserEmailIgnoreCase(profile.getUserEmail());
        if (existingOpt.isPresent()) {
            CitizenProfile existing = existingOpt.get();
            existing.setFullName(profile.getFullName());
            existing.setPhoneNumber(profile.getPhoneNumber());
            existing.setHomeAddress(profile.getHomeAddress());
            existing.setNationalId(profile.getNationalId());
            profileRepository.save(existing);
            return ResponseEntity.ok(existing);
        }

        profileRepository.save(profile);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfileByEmail(@RequestParam String email) {
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email parameter is required."));
        }
        
        String normalizedEmail = email.trim().toLowerCase();
        Optional<CitizenProfile> profileOpt = profileRepository.findByUserEmailIgnoreCase(normalizedEmail);
        
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(profileOpt.get());
    }
}

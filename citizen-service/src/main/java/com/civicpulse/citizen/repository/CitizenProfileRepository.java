package com.civicpulse.citizen.repository;

import com.civicpulse.citizen.domain.CitizenProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, Long> {
    Optional<CitizenProfile> findByUserEmailIgnoreCase(String userEmail);
}

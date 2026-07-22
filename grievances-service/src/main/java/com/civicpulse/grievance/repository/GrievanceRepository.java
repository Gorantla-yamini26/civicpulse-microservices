package com.civicpulse.grievance.repository;

import com.civicpulse.grievance.domain.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCreatorEmailIgnoreCase(String creatorEmail);
    List<Grievance> findByAssigneeEmailIgnoreCase(String assigneeEmail);
    Optional<Grievance> findByTrackingNumber(String trackingNumber);
}

package com.civicpulse.user.repository;

import java.util.List; // <-- ADD THIS IMPORT HERE
import java.util.Optional;
import com.civicpulse.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmailIgnoreCase(String email);
    
    List<User> findByRole(User.Role role); // This line will now be completely fixed!
}
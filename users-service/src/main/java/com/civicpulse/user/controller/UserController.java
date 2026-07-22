package com.civicpulse.user.controller;

import com.civicpulse.user.domain.User;
import com.civicpulse.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

//import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String roleStr = request.get("role");

        if (email == null || password == null || roleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, password, and role are required."));
        }

        // Normalize email
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists."));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role. Supported roles: CITIZEN, ADMIN, FIELD_OFFICER."));
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "message", "User registered successfully."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        // Normalize email to satisfy lower-casing and trim specifications
        String normalizedEmail = email.trim().toLowerCase();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials."));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials."));
        }

        // Return credentials data. Role is fetched dynamically from the database.
        return ResponseEntity.ok(Map.of(
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "token", "simulated-jwt-payload-token-string"
        ));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null) {
            try {
                User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
                return ResponseEntity.ok(userRepository.findByRole(roleEnum));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role parameter."));
            }
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/count")
    public ResponseEntity<?> getUserCount() {
        return ResponseEntity.ok(Map.of("count", userRepository.count()));
    }
}

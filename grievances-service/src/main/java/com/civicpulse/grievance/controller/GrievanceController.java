package com.civicpulse.grievance.controller;

import com.civicpulse.grievance.domain.Grievance;
import com.civicpulse.grievance.repository.GrievanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/grievances")
public class GrievanceController {

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    // In-memory cache for event notification feed aggregated from Kafka
    private final List<Map<String, Object>> notificationFeed = new CopyOnWriteArrayList<>();
    private final Random random = new Random();

    // 1. Create a grievance record (handles SLA logic)
    @PostMapping
    public ResponseEntity<?> createGrievance(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String description = request.get("description");
        String category = request.get("category");
        String priorityStr = request.get("priority");
        String creatorEmail = request.get("creatorEmail");

        if (title == null || description == null || category == null || priorityStr == null || creatorEmail == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title, description, category, priority, and creatorEmail are required."));
        }

        Grievance.Priority priority;
        try {
            priority = Grievance.Priority.valueOf(priorityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid priority. Supported: LOW, MEDIUM, HIGH."));
        }

        Grievance grievance = new Grievance();
        grievance.setTitle(title);
        grievance.setDescription(description);
        grievance.setCategory(category);
        grievance.setPriority(priority);
        grievance.setCreatorEmail(creatorEmail.trim().toLowerCase());
        grievance.setStatus(Grievance.Status.OPEN);

        // Calculate tracking number
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randId = random.nextInt(900) + 100;
        grievance.setTrackingNumber("CPN-" + datePrefix + "-" + randId);

        // Apply SLA Timelines
        LocalDateTime now = LocalDateTime.now();
        grievance.setCreatedAt(now);
        if (priority == Grievance.Priority.HIGH) {
            grievance.setDueAt(now.plusHours(48)); // 2 Days
        } else if (priority == Grievance.Priority.MEDIUM) {
            grievance.setDueAt(now.plusHours(120)); // 5 Days
        } else {
            grievance.setDueAt(now.plusHours(240)); // 10 Days
        }

        grievanceRepository.save(grievance);

        // Stream event notification via Kafka
        String eventMsg = "New " + priority.name() + " Priority grievance logged: " + grievance.getTrackingNumber();
        sendKafkaEvent("GRIEVANCE_FILED", grievance.getTrackingNumber(), eventMsg, "admin@civicpulse.gov");

        return ResponseEntity.status(HttpStatus.CREATED).body(grievance);
    }

    // 2. Retrieve complaints (checks & dynamically marks overdue items)
    @GetMapping
    public ResponseEntity<List<Grievance>> getAllGrievances(
            @RequestParam(required = false) String creatorEmail,
            @RequestParam(required = false) String assigneeEmail) {

        List<Grievance> list;
        if (creatorEmail != null) {
            list = grievanceRepository.findByCreatorEmailIgnoreCase(creatorEmail.trim());
        } else if (assigneeEmail != null) {
            list = grievanceRepository.findByAssigneeEmailIgnoreCase(assigneeEmail.trim());
        } else {
            list = grievanceRepository.findAll();
        }

        // Apply dynamic SLA validation logic to open items
        LocalDateTime now = LocalDateTime.now();
        boolean changed = false;
        for (Grievance g : list) {
            if (g.getStatus() == Grievance.Status.OPEN && now.isAfter(g.getDueAt())) {
                g.setStatus(Grievance.Status.EXPIRED_OVERDUE);
                grievanceRepository.save(g);
                changed = true;

                // Send event notify
                sendKafkaEvent("GRIEVANCE_OVERDUE", g.getTrackingNumber(), "Ticket " + g.getTrackingNumber() + " has exceeded SLA parameters!", g.getCreatorEmail());
            }
        }
        
        if (changed && (creatorEmail == null && assigneeEmail == null)) {
            list = grievanceRepository.findAll();
        }

        return ResponseEntity.ok(list);
    }

    // 3. Admin assigns official
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignGrievance(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String assigneeEmail = request.get("assigneeEmail");
        if (assigneeEmail == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assignee email is required."));
        }

        Optional<Grievance> opt = grievanceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Grievance grievance = opt.get();
        grievance.setAssigneeEmail(assigneeEmail.trim().toLowerCase());
        grievanceRepository.save(grievance);

        String msg = "Grievance " + grievance.getTrackingNumber() + " assigned to field officer: " + assigneeEmail;
        sendKafkaEvent("GRIEVANCE_ASSIGNED", grievance.getTrackingNumber(), msg, assigneeEmail);

        return ResponseEntity.ok(grievance);
    }

    // 4. Update status (e.g. resolve)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String statusStr = request.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status string is required."));
        }

        Optional<Grievance> opt = grievanceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Grievance grievance = opt.get();
        Grievance.Status status;
        try {
            status = Grievance.Status.fromValue(statusStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + statusStr));
        }

        grievance.setStatus(status);
        if (status == Grievance.Status.RESOLVED) {
            grievance.setResolvedAt(LocalDateTime.now());
        }
        grievanceRepository.save(grievance);

        String msg = "Grievance " + grievance.getTrackingNumber() + " is now " + status.getValue();
        sendKafkaEvent("GRIEVANCE_STATUS_CHANGED", grievance.getTrackingNumber(), msg, grievance.getCreatorEmail());

        return ResponseEntity.ok(grievance);
    }

    // 5. REST endpoint to fetch Kafka notifications stream
    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        return ResponseEntity.ok(notificationFeed);
    }

    // Helper method to publish message
    private void sendKafkaEvent(String type, String trackingNumber, String message, String recipient) {
        Map<String, Object> event = new HashMap<>();
        event.put("id", System.currentTimeMillis() + random.nextInt(100));
        event.put("eventType", type);
        event.put("trackingNumber", trackingNumber);
        event.put("message", message);
        event.put("recipientEmail", recipient);
        event.put("timestamp", LocalDateTime.now().toString());

        // Add to local feed (acts as consumer cache)
        notificationFeed.add(0, event); // Latest first

        // Publish to real Kafka if dependency is active
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send("civicpulse-events", trackingNumber, message);
            } catch (Exception e) {
                // Fail-safe logging for local environment
                System.out.println("Kafka Broker not reachable. Streaming simulation cached local event: " + message);
            }
        }
    }

    // Listener simulating Kafka consumer stream
    @KafkaListener(topics = "civicpulse-events", groupId = "civicpulse-grievance-group")
    public void consumeKafkaMessage(String message) {
        System.out.println("Kafka Consumed Message: " + message);
    }
}

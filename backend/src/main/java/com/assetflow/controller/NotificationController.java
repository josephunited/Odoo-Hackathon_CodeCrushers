package com.assetflow.controller;

import com.assetflow.entity.Notification;
import com.assetflow.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Notification>> getUnread(@PathVariable Long employeeId) {
        return ResponseEntity.ok(notificationRepository.findByEmployeeIdAndIsReadFalseOrderByCreatedAtDesc(employeeId));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok().build();
    }
    
    // Test endpoint to generate a notification
    @PostMapping("/generate")
    public ResponseEntity<Notification> generate(@RequestParam Long employeeId, @RequestParam String message) {
        Notification n = Notification.builder()
                .employeeId(employeeId)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(notificationRepository.save(n));
    }
}

package com.assetflow.controller;

import com.assetflow.dto.NotificationDTO;
import com.assetflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<NotificationDTO> sendNotification(
            @RequestParam Long employeeId,
            @RequestParam String message) {
        return ResponseEntity.ok(notificationService.sendNotification(employeeId, message));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(notificationService.getNotificationsForEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForEmployee(employeeId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/employee/{employeeId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long employeeId) {
        notificationService.markAllAsRead(employeeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}

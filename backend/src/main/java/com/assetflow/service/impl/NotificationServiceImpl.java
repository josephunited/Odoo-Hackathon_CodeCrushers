package com.assetflow.service.impl;

import com.assetflow.dto.NotificationDTO;
import com.assetflow.entity.Notification;
import com.assetflow.repository.NotificationRepository;
import com.assetflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public NotificationDTO sendNotification(Long employeeId, String message) {
        Notification notification = Notification.builder()
                .employeeId(employeeId)
                .message(message)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Override
    public List<NotificationDTO> getNotificationsForEmployee(Long employeeId) {
        return notificationRepository.findByEmployeeIdOrderByTimestampDesc(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getUnreadNotificationsForEmployee(Long employeeId) {
        return notificationRepository.findByEmployeeIdAndIsReadOrderByTimestampDesc(employeeId, false).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found with ID: " + id));

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long employeeId) {
        List<Notification> unread = notificationRepository.findByEmployeeIdAndIsReadOrderByTimestampDesc(employeeId, false);
        for (Notification notification : unread) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found with ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .employeeId(notification.getEmployeeId())
                .message(notification.getMessage())
                .timestamp(notification.getTimestamp())
                .isRead(notification.isRead())
                .build();
    }
}

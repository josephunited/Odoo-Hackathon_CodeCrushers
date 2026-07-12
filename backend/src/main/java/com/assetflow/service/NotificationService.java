package com.assetflow.service;

import com.assetflow.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    NotificationDTO sendNotification(Long employeeId, String message);
    List<NotificationDTO> getNotificationsForEmployee(Long employeeId);
    List<NotificationDTO> getUnreadNotificationsForEmployee(Long employeeId);
    NotificationDTO markAsRead(Long id);
    void markAllAsRead(Long employeeId);
    void deleteNotification(Long id);
}

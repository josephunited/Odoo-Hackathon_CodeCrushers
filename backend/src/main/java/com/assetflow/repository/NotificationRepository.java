package com.assetflow.repository;

import com.assetflow.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeeIdOrderByTimestampDesc(Long employeeId);
    List<Notification> findByEmployeeIdAndIsReadOrderByTimestampDesc(Long employeeId, boolean isRead);
}

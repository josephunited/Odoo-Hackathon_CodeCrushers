package com.assetflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee ID is required")
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @NotBlank(message = "Notification message is required")
    @Column(nullable = false, length = 1000)
    private String message;

    @NotNull(message = "Timestamp is required")
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;
}

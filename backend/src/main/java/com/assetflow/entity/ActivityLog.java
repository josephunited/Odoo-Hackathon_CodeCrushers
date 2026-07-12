package com.assetflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_actlog_timestamp", columnList = "timestamp"),
    @Index(name = "idx_actlog_actor", columnList = "actor_username"),
    @Index(name = "idx_actlog_module", columnList = "module")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Which feature area triggered this event (ASSET, AUDIT, BOOKING, MAINTENANCE, AUTH, etc.) */
    @Column(nullable = false, length = 50)
    private String module;

    /** Fine-grained action code, e.g. ASSET_CREATED, AUDIT_CLOSED, BOOKING_APPROVED */
    @Column(name = "action_type", nullable = false, length = 80)
    private String actionType;

    /** Human-readable description of what happened */
    @Column(nullable = false, length = 512)
    private String description;

    /** Username of the person who performed the action */
    @Column(name = "actor_username", length = 100)
    private String actorUsername;

    /** Optional: primary entity type affected (Asset, Audit, Booking, …) */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /** Optional: primary entity ID affected */
    @Column(name = "entity_id")
    private Long entityId;

    /** Optional: human-readable name/tag of the affected entity */
    @Column(name = "entity_name", length = 200)
    private String entityName;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}

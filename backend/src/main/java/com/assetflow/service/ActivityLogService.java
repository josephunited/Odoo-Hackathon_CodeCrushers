package com.assetflow.service;

import com.assetflow.dto.ActivityLogDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Central activity log service.
 *
 * <p>Any service (Audit, Asset, Booking, Maintenance, Auth) can autowire this and call
 * {@code log()} to record an event.  The controller layer exposes read-only query endpoints.
 */
public interface ActivityLogService {

    // ── Write ──────────────────────────────────────────────────────────────────

    /**
     * Record an activity event.
     *
     * @param module        Feature area (ASSET, AUDIT, BOOKING, MAINTENANCE, AUTH, SYSTEM)
     * @param actionType    Specific action code (e.g. ASSET_CREATED, AUDIT_CLOSED)
     * @param description   Human-readable sentence describing the event
     * @param actorUsername Username of the person triggering the action (nullable)
     * @param entityType    Affected entity class name, e.g. "Asset" (nullable)
     * @param entityId      Affected entity PK (nullable)
     * @param entityName    Affected entity display name/tag (nullable)
     */
    ActivityLogDTO log(String module, String actionType, String description,
                       String actorUsername, String entityType, Long entityId, String entityName);

    // ── Read ───────────────────────────────────────────────────────────────────

    /** Last 20 events for the dashboard recent-activity feed */
    List<ActivityLogDTO> getRecentActivity();

    /**
     * Paginated, filtered log query.
     *
     * @param module        Filter by module (null = all)
     * @param actorUsername Filter by actor (null = all)
     * @param actionType    Filter by action type (null = all)
     * @param from          Start of date range (null = no lower bound)
     * @param to            End of date range (null = no upper bound)
     * @param search        Keyword search on description / entity name (null = all)
     * @param page          0-based page index
     * @param size          Page size (max 200)
     */
    Page<ActivityLogDTO> getLogs(String module, String actorUsername, String actionType,
                                  LocalDateTime from, LocalDateTime to,
                                  String search, int page, int size);

    /** Distinct actors for frontend filter dropdown */
    List<String> getDistinctActors();

    /** Distinct modules for frontend filter dropdown */
    List<String> getDistinctModules();
}

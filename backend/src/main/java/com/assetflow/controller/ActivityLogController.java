package com.assetflow.controller;

import com.assetflow.dto.ActivityLogDTO;
import com.assetflow.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity-logs")

@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    /**
     * GET /api/activity-logs/recent
     * Last 20 events — used by the Dashboard recent-activity feed.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLogDTO>> getRecentActivity() {
        return ResponseEntity.ok(activityLogService.getRecentActivity());
    }

    /**
     * GET /api/activity-logs
     * Paginated, fully-filtered log query.
     *
     * Query params (all optional):
     *   module, actorUsername, actionType, from (ISO datetime), to (ISO datetime),
     *   search, page (default 0), size (default 25, max 200)
     */
    @GetMapping
    public ResponseEntity<Page<ActivityLogDTO>> getLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String actorUsername,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return ResponseEntity.ok(
                activityLogService.getLogs(module, actorUsername, actionType, from, to, search, page, size)
        );
    }

    /**
     * GET /api/activity-logs/meta
     * Returns distinct actors and modules for filter dropdowns.
     */
    @GetMapping("/meta")
    public ResponseEntity<Map<String, List<String>>> getMeta() {
        return ResponseEntity.ok(Map.of(
                "actors",  activityLogService.getDistinctActors(),
                "modules", activityLogService.getDistinctModules()
        ));
    }
}

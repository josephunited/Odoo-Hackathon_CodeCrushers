package com.assetflow.service.impl;

import com.assetflow.dto.ActivityLogDTO;
import com.assetflow.entity.ActivityLog;
import com.assetflow.repository.ActivityLogRepository;
import com.assetflow.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository repo;

    // ── Write ──────────────────────────────────────────────────────────────────

    @Override
    public ActivityLogDTO log(String module, String actionType, String description,
                              String actorUsername, String entityType, Long entityId, String entityName) {
        ActivityLog entry = ActivityLog.builder()
                .module(module)
                .actionType(actionType)
                .description(description)
                .actorUsername(actorUsername)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .timestamp(LocalDateTime.now())
                .build();

        return mapToDTO(repo.save(entry));
    }

    // ── Read ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getRecentActivity() {
        return repo.findTop20ByOrderByTimestampDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLogDTO> getLogs(String module, String actorUsername, String actionType,
                                         LocalDateTime from, LocalDateTime to,
                                         String search, int page, int size) {
        int cappedSize = Math.min(size, 200);
        return repo.findFiltered(
                emptyToNull(module),
                emptyToNull(actorUsername),
                emptyToNull(actionType),
                from, to,
                emptyToNull(search),
                PageRequest.of(page, cappedSize)
        ).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctActors() {
        return repo.findDistinctActors();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctModules() {
        return repo.findDistinctModules();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private ActivityLogDTO mapToDTO(ActivityLog log) {
        return ActivityLogDTO.builder()
                .id(log.getId())
                .module(log.getModule())
                .actionType(log.getActionType())
                .description(log.getDescription())
                .actorUsername(log.getActorUsername())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .entityName(log.getEntityName())
                .timestamp(log.getTimestamp())
                .build();
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}

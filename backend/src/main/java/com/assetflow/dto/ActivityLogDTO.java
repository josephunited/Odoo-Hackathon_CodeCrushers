package com.assetflow.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogDTO {

    private Long id;
    private String module;
    private String actionType;
    private String description;
    private String actorUsername;
    private String entityType;
    private Long entityId;
    private String entityName;
    private LocalDateTime timestamp;
}

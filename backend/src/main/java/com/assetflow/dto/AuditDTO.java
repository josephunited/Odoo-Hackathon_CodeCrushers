package com.assetflow.dto;

import com.assetflow.entity.AuditStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditDTO {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private AuditStatus status;
    private Long auditorId;
    private String auditorName;
    private LocalDate createdDate;
    private LocalDate completedDate;
    
    private int totalAssets;
    private int verifiedAssets;
    private int missingAssets;
    private int damagedAssets;
    private int pendingAssets;
    
    private List<AuditItemDTO> items;
}

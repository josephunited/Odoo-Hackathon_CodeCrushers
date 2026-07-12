package com.assetflow.dto;

import com.assetflow.entity.MaintenanceStatus;
import com.assetflow.entity.MaintenanceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceResponseDTO {

    private Long id;
    private Long assetId;
    private String assetName;
    private String assetTag;
    private String issue;
    private String resolutionDetails;
    private LocalDate requestDate;
    private LocalDate scheduledDate;
    private LocalDate completionDate;
    private Double cost;
    private MaintenanceStatus status;
    private MaintenanceType maintenanceType;
}

package com.assetflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaintenanceRequestDto {
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "Employee ID is required")
    private Long reportedBy;

    private String description;
}

package com.assetflow.dto;

import com.assetflow.entity.MaintenanceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestDTO {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotBlank(message = "Issue description is required")
    private String issue;

    @NotNull(message = "Maintenance type is required")
    private MaintenanceType maintenanceType;
}

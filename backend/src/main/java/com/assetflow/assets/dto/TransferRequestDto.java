package com.assetflow.assets.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequestDto {

    // For submitting a request
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "To Employee ID is required")
    private Long toEmployeeId;

    private String toEmployeeName;
    private String requestedBy;
    private String remarks;

    // For processing a request (Approve/Reject)
    private Long transferId;
    private boolean approved;
    private String processedBy;
}

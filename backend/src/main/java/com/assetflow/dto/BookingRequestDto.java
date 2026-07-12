package com.assetflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDto {
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String purpose;
}

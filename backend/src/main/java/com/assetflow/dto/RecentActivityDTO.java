package com.assetflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivityDTO {
    private Long id;
    private String assetTag;
    private String assetName;
    private String actionType;
    private String performedBy;
    private String details;
    private LocalDateTime actionDate;
}

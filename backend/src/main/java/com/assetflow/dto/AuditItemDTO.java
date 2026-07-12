package com.assetflow.dto;

import com.assetflow.entity.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditItemDTO {
    private Long id;
    private Long assetId;
    private String assetTag;
    private String assetName;
    private String assetSerialNumber;
    private String assetLocation;
    private String assetStatus;
    private String assetCondition;
    private VerificationStatus status;
    private String notes;
    private String verifiedBy;
    private LocalDate verifiedDate;
}

package com.assetflow.service;

import com.assetflow.dto.AuditDTO;
import com.assetflow.entity.VerificationStatus;

import java.time.LocalDate;
import java.util.List;

public interface AuditService {
    
    AuditDTO createAuditCycle(String name, LocalDate startDate, LocalDate endDate, Long auditorId, String auditorName);
    
    AuditDTO getActiveAuditCycle();
    
    List<AuditDTO> getAuditHistory();
    
    AuditDTO getAuditDetails(Long auditId);
    
    AuditDTO verifyAsset(Long auditId, Long assetId, VerificationStatus status, String notes, String verifiedBy);
    
    AuditDTO closeAuditCycle(Long auditId);
}

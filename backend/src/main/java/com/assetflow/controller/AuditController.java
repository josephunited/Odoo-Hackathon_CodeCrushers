package com.assetflow.controller;

import com.assetflow.dto.AuditDTO;
import com.assetflow.entity.VerificationStatus;
import com.assetflow.service.AuditService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/audits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditController {

    private final AuditService auditService;

    @Data
    public static class CreateAuditRequest {
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long auditorId;
        private String auditorName;
    }

    @Data
    public static class VerifyAssetRequest {
        private Long assetId;
        private VerificationStatus status;
        private String notes;
        private String verifiedBy;
    }

    @PostMapping
    public ResponseEntity<AuditDTO> createAuditCycle(@RequestBody CreateAuditRequest request) {
        AuditDTO dto = auditService.createAuditCycle(
                request.getName(),
                request.getStartDate(),
                request.getEndDate(),
                request.getAuditorId(),
                request.getAuditorName()
        );
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/active")
    public ResponseEntity<AuditDTO> getActiveAuditCycle() {
        AuditDTO dto = auditService.getActiveAuditCycle();
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/history")
    public ResponseEntity<List<AuditDTO>> getAuditHistory() {
        return ResponseEntity.ok(auditService.getAuditHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditDTO> getAuditDetails(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getAuditDetails(id));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<AuditDTO> verifyAsset(
            @PathVariable Long id,
            @RequestBody VerifyAssetRequest request) {
        AuditDTO dto = auditService.verifyAsset(
                id,
                request.getAssetId(),
                request.getStatus(),
                request.getNotes(),
                request.getVerifiedBy()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<AuditDTO> closeAuditCycle(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.closeAuditCycle(id));
    }
}

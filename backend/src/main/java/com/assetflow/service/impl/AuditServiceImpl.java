package com.assetflow.service.impl;

import com.assetflow.assets.model.*;
import com.assetflow.assets.repository.AssetHistoryRepository;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.dto.AuditDTO;
import com.assetflow.dto.AuditItemDTO;
import com.assetflow.entity.Audit;
import com.assetflow.entity.AuditItem;
import com.assetflow.entity.AuditStatus;
import com.assetflow.entity.VerificationStatus;
import com.assetflow.repository.AuditRepository;
import com.assetflow.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditServiceImpl implements AuditService {

    private final AuditRepository auditRepository;
    private final AssetRepository assetRepository;
    private final AssetHistoryRepository assetHistoryRepository;

    @Override
    public AuditDTO createAuditCycle(String name, LocalDate startDate, LocalDate endDate, Long auditorId, String auditorName) {
        // Ensure no active audit cycle exists
        auditRepository.findByStatus(AuditStatus.ACTIVE).ifPresent(a -> {
            throw new IllegalStateException("An active audit cycle '" + a.getName() + "' already exists. Close it first.");
        });

        List<Asset> activeAssets = assetRepository.findAll().stream()
                .filter(a -> a.getStatus() != AssetStatus.RETIRED && a.getStatus() != AssetStatus.DISPOSED)
                .collect(Collectors.toList());

        Audit audit = Audit.builder()
                .name(name)
                .startDate(startDate)
                .endDate(endDate)
                .status(AuditStatus.ACTIVE)
                .auditorId(auditorId)
                .auditorName(auditorName)
                .createdDate(LocalDate.now())
                .build();

        List<AuditItem> items = activeAssets.stream()
                .map(asset -> AuditItem.builder()
                        .audit(audit)
                        .asset(asset)
                        .status(VerificationStatus.PENDING)
                        .build())
                .collect(Collectors.toList());

        audit.setAuditItems(items);

        Audit savedAudit = auditRepository.save(audit);
        return mapToDTO(savedAudit);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditDTO getActiveAuditCycle() {
        return auditRepository.findByStatus(AuditStatus.ACTIVE)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditDTO> getAuditHistory() {
        return auditRepository.findAllByOrderByCreatedDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AuditDTO getAuditDetails(Long auditId) {
        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new IllegalArgumentException("Audit cycle not found with ID: " + auditId));
        return mapToDTO(audit);
    }

    @Override
    public AuditDTO verifyAsset(Long auditId, Long assetId, VerificationStatus status, String notes, String verifiedBy) {
        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new IllegalArgumentException("Audit cycle not found with ID: " + auditId));

        if (audit.getStatus() != AuditStatus.ACTIVE) {
            throw new IllegalStateException("Cannot verify assets on a completed audit cycle.");
        }

        AuditItem item = audit.getAuditItems().stream()
                .filter(i -> i.getAsset().getId().equals(assetId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Asset not found in this audit cycle."));

        // Update item verification
        item.setStatus(status);
        item.setNotes(notes);
        item.setVerifiedBy(verifiedBy);
        item.setVerifiedDate(LocalDate.now());

        // Integrate with Asset status
        Asset asset = item.getAsset();
        String actionDetails = "Asset audited in cycle: " + audit.getName() + ". Verification Status: " + status;
        if (notes != null && !notes.trim().isEmpty()) {
            actionDetails += ". Notes: " + notes;
        }

        if (status == VerificationStatus.MISSING) {
            asset.setStatus(AssetStatus.LOST);
            assetRepository.save(asset);
        } else if (status == VerificationStatus.DAMAGED) {
            asset.setAssetCondition(AssetCondition.DAMAGED);
            asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
            assetRepository.save(asset);
        } else if (status == VerificationStatus.VERIFIED) {
            // Keep status but write to history log
            if (asset.getStatus() == AssetStatus.LOST) {
                asset.setStatus(AssetStatus.AVAILABLE); // recover if previously lost
                assetRepository.save(asset);
            }
        }

        // Log audit event into AssetHistory
        AssetHistory history = AssetHistory.builder()
                .asset(asset)
                .actionType("AUDIT_" + status.name())
                .actionDate(LocalDateTime.now())
                .performedBy(verifiedBy)
                .details(actionDetails)
                .build();
        assetHistoryRepository.save(history);

        Audit savedAudit = auditRepository.save(audit);
        return mapToDTO(savedAudit);
    }

    @Override
    public AuditDTO closeAuditCycle(Long auditId) {
        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new IllegalArgumentException("Audit cycle not found with ID: " + auditId));

        if (audit.getStatus() == AuditStatus.COMPLETED) {
            throw new IllegalStateException("Audit cycle is already closed.");
        }

        // Close it
        audit.setStatus(AuditStatus.COMPLETED);
        audit.setCompletedDate(LocalDate.now());

        Audit savedAudit = auditRepository.save(audit);
        return mapToDTO(savedAudit);
    }

    private AuditDTO mapToDTO(Audit audit) {
        int total = audit.getAuditItems().size();
        int verified = 0;
        int missing = 0;
        int damaged = 0;
        int pending = 0;

        for (AuditItem item : audit.getAuditItems()) {
            switch (item.getStatus()) {
                case VERIFIED: verified++; break;
                case MISSING: missing++; break;
                case DAMAGED: damaged++; break;
                case PENDING: pending++; break;
            }
        }

        List<AuditItemDTO> itemDTOs = audit.getAuditItems().stream()
                .map(i -> AuditItemDTO.builder()
                        .id(i.getId())
                        .assetId(i.getAsset().getId())
                        .assetTag(i.getAsset().getAssetTag())
                        .assetName(i.getAsset().getName())
                        .assetSerialNumber(i.getAsset().getSerialNumber())
                        .assetLocation(i.getAsset().getLocation())
                        .assetStatus(i.getAsset().getStatus().name())
                        .assetCondition(i.getAsset().getAssetCondition().name())
                        .status(i.getStatus())
                        .notes(i.getNotes())
                        .verifiedBy(i.getVerifiedBy())
                        .verifiedDate(i.getVerifiedDate())
                        .build())
                .collect(Collectors.toList());

        return AuditDTO.builder()
                .id(audit.getId())
                .name(audit.getName())
                .startDate(audit.getStartDate())
                .endDate(audit.getEndDate())
                .status(audit.getStatus())
                .auditorId(audit.getAuditorId())
                .auditorName(audit.getAuditorName())
                .createdDate(audit.getCreatedDate())
                .completedDate(audit.getCompletedDate())
                .totalAssets(total)
                .verifiedAssets(verified)
                .missingAssets(missing)
                .damagedAssets(damaged)
                .pendingAssets(pending)
                .items(itemDTOs)
                .build();
    }
}

package com.assetflow.service.impl;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.assets.service.AssetHistoryService;
import com.assetflow.dto.MaintenanceRequestDTO;
import com.assetflow.dto.MaintenanceResponseDTO;
import com.assetflow.entity.Maintenance;
import com.assetflow.entity.MaintenanceStatus;
import com.assetflow.repository.MaintenanceRepository;
import com.assetflow.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final AssetHistoryService historyService;

    @Override
    @Transactional
    public MaintenanceResponseDTO createRequest(MaintenanceRequestDTO dto) {
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + dto.getAssetId()));

        Maintenance maintenance = Maintenance.builder()
                .asset(asset)
                .issue(dto.getIssue())
                .requestDate(LocalDate.now())
                .cost(0.0)
                .status(MaintenanceStatus.REQUESTED)
                .maintenanceType(dto.getMaintenanceType())
                .build();

        Maintenance saved = maintenanceRepository.save(maintenance);
        
        // Log to Asset History
        historyService.logHistory(asset, "MAINTENANCE_REQUEST", "System", 
                "Maintenance requested. Issue: " + dto.getIssue() + " (" + dto.getMaintenanceType() + ")");

        return mapToResponse(saved);
    }

    @Override
    public MaintenanceResponseDTO getById(Long id) {
        Maintenance record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance record not found with ID: " + id));
        return mapToResponse(record);
    }

    @Override
    public List<MaintenanceResponseDTO> getAllRequests() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaintenanceResponseDTO> getRequestsByAsset(Long assetId) {
        return maintenanceRepository.findByAssetId(assetId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MaintenanceResponseDTO scheduleMaintenance(Long id, LocalDate scheduledDate) {
        Maintenance record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance record not found with ID: " + id));

        if (scheduledDate == null || scheduledDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Scheduled date must be in the future.");
        }

        record.setScheduledDate(scheduledDate);
        record.setStatus(MaintenanceStatus.SCHEDULED);
        Maintenance saved = maintenanceRepository.save(record);

        historyService.logHistory(record.getAsset(), "MAINTENANCE_SCHEDULED", "System", 
                "Maintenance scheduled for: " + scheduledDate);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MaintenanceResponseDTO resolveMaintenance(Long id, String resolutionDetails, Double cost) {
        Maintenance record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance record not found with ID: " + id));

        if (cost == null || cost < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cost must be a positive number.");
        }

        record.setResolutionDetails(resolutionDetails);
        record.setCost(cost);
        record.setCompletionDate(LocalDate.now());
        record.setStatus(MaintenanceStatus.COMPLETED);
        
        // Revert Asset status back to AVAILABLE
        Asset asset = record.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        Maintenance saved = maintenanceRepository.save(record);

        historyService.logHistory(asset, "MAINTENANCE_COMPLETED", "System", 
                "Maintenance completed. Resolution: " + resolutionDetails + ", Cost: $" + cost);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MaintenanceResponseDTO updateStatus(Long id, MaintenanceStatus status) {
        Maintenance record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance record not found with ID: " + id));

        record.setStatus(status);

        Asset asset = record.getAsset();
        if (status == MaintenanceStatus.IN_PROGRESS) {
            // Update Asset status to UNDER_MAINTENANCE when maintenance starts
            asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
            assetRepository.save(asset);
        } else if (status == MaintenanceStatus.CANCELLED) {
            // Revert Asset status back to AVAILABLE if maintenance is cancelled
            asset.setStatus(AssetStatus.AVAILABLE);
            assetRepository.save(asset);
        }

        Maintenance saved = maintenanceRepository.save(record);

        historyService.logHistory(asset, "MAINTENANCE_STATUS_UPDATE", "System", 
                "Maintenance status updated to: " + status);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteRequest(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance record not found with ID: " + id);
        }
        maintenanceRepository.deleteById(id);
    }

    private MaintenanceResponseDTO mapToResponse(Maintenance record) {
        return MaintenanceResponseDTO.builder()
                .id(record.getId())
                .assetId(record.getAsset().getId())
                .assetName(record.getAsset().getName())
                .assetTag(record.getAsset().getAssetTag())
                .issue(record.getIssue())
                .resolutionDetails(record.getResolutionDetails())
                .requestDate(record.getRequestDate())
                .scheduledDate(record.getScheduledDate())
                .completionDate(record.getCompletionDate())
                .cost(record.getCost())
                .status(record.getStatus())
                .maintenanceType(record.getMaintenanceType())
                .build();
    }
}

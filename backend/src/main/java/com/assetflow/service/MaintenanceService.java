package com.assetflow.service;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.dto.MaintenanceRequestDto;
import com.assetflow.entity.MaintenanceRequest;
import com.assetflow.entity.MaintenanceStatus;
import com.assetflow.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public MaintenanceRequest reportMaintenance(MaintenanceRequestDto request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (asset.getStatus() == AssetStatus.UNDER_MAINTENANCE || asset.getStatus() == AssetStatus.RETIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset cannot be sent to maintenance, status is: " + asset.getStatus());
        }

        MaintenanceRequest mReq = MaintenanceRequest.builder()
                .asset(asset)
                .reportedBy(request.getReportedBy())
                .description(request.getDescription())
                .reportDate(LocalDate.now())
                .status(MaintenanceStatus.REPORTED)
                .build();

        asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
        assetRepository.save(asset);

        MaintenanceRequest saved = maintenanceRepository.save(mReq);
        activityLogService.log("MAINTENANCE", "REPORTED", "Reported maintenance issue for " + asset.getName(), "Employee #" + request.getReportedBy(), "MaintenanceRequest", saved.getId(), "MReq-" + saved.getId());
        return saved;
    }

    @Transactional
    public MaintenanceRequest completeMaintenance(Long id, Double cost) {
        MaintenanceRequest mReq = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        mReq.setStatus(MaintenanceStatus.COMPLETED);
        mReq.setCompletionDate(LocalDate.now());
        mReq.setCost(cost);
        
        Asset asset = mReq.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        MaintenanceRequest saved = maintenanceRepository.save(mReq);
        activityLogService.log("MAINTENANCE", "COMPLETED", "Maintenance completed for " + asset.getName() + " costing $" + cost, "System", "MaintenanceRequest", saved.getId(), "MReq-" + saved.getId());
        return saved;
    }

    public List<MaintenanceRequest> getAll() {
        return maintenanceRepository.findAll();
    }
}

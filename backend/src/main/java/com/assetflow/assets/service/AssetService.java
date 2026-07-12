package com.assetflow.assets.service;

import com.assetflow.assets.dto.AssetDto;
import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetHistoryService historyService;

    @Transactional
    public Asset createAsset(AssetDto dto) {
        if (assetRepository.existsBySerialNumber(dto.getSerialNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset with serial number " + dto.getSerialNumber() + " already exists.");
        }

        String nextTag = generateNextAssetTag();
        Asset asset = Asset.builder()
                .assetTag(nextTag)
                .name(dto.getName())
                .category(dto.getCategory())
                .serialNumber(dto.getSerialNumber())
                .purchaseDate(dto.getPurchaseDate())
                .purchaseCost(dto.getPurchaseCost())
                .assetCondition(dto.getAssetCondition())
                .location(dto.getLocation())
                .sharedBookable(dto.isSharedBookable())
                .status(dto.getStatus() != null ? dto.getStatus() : AssetStatus.AVAILABLE)
                .imageUrl(dto.getImageUrl())
                .build();

        Asset savedAsset = assetRepository.save(asset);
        
        historyService.logHistory(savedAsset, "REGISTRATION", "Admin", 
                "Asset registered in system with tag: " + nextTag + ", initial condition: " + dto.getAssetCondition());
        
        return savedAsset;
    }

    @Transactional
    public Asset updateAsset(Long id, AssetDto dto) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + id));

        // Check serial number uniqueness if changed
        if (!asset.getSerialNumber().equals(dto.getSerialNumber()) && 
            assetRepository.existsBySerialNumber(dto.getSerialNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serial number " + dto.getSerialNumber() + " is already in use by another asset.");
        }

        StringBuilder historyDetails = new StringBuilder("Asset updated: ");
        if (!asset.getName().equals(dto.getName())) {
            historyDetails.append("Name changed [").append(asset.getName()).append(" -> ").append(dto.getName()).append("]. ");
        }
        if (!asset.getStatus().equals(dto.getStatus())) {
            historyDetails.append("Status changed [").append(asset.getStatus()).append(" -> ").append(dto.getStatus()).append("]. ");
        }
        if (!asset.getAssetCondition().equals(dto.getAssetCondition())) {
            historyDetails.append("Condition changed [").append(asset.getAssetCondition()).append(" -> ").append(dto.getAssetCondition()).append("]. ");
        }
        if (!asset.getLocation().equals(dto.getLocation())) {
            historyDetails.append("Location changed [").append(asset.getLocation()).append(" -> ").append(dto.getLocation()).append("]. ");
        }

        asset.setName(dto.getName());
        asset.setCategory(dto.getCategory());
        asset.setSerialNumber(dto.getSerialNumber());
        asset.setPurchaseDate(dto.getPurchaseDate());
        asset.setPurchaseCost(dto.getPurchaseCost());
        asset.setAssetCondition(dto.getAssetCondition());
        asset.setLocation(dto.getLocation());
        asset.setSharedBookable(dto.isSharedBookable());
        if (dto.getStatus() != null) {
            asset.setStatus(dto.getStatus());
        }
        asset.setImageUrl(dto.getImageUrl());

        Asset updatedAsset = assetRepository.save(asset);
        
        historyService.logHistory(updatedAsset, "UPDATE", "Admin", historyDetails.toString());
        
        return updatedAsset;
    }

    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + id));
        
        // Due to foreign keys, the simplest delete strategy is calling delete which cascading is handled by JPA or manual delete.
        // We will perform deletion of asset history or other records to prevent constraints issues.
        // Alternatively, soft-delete or simple deletion is fine. Let's delete.
        assetRepository.delete(asset);
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + id));
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public List<Asset> searchAssets(String tag, String serial, String category, AssetStatus status, String location, String department) {
        return assetRepository.searchAssets(
                tag == null || tag.trim().isEmpty() ? null : tag,
                serial == null || serial.trim().isEmpty() ? null : serial,
                category == null || category.trim().isEmpty() ? null : category,
                status,
                location == null || location.trim().isEmpty() ? null : location,
                department == null || department.trim().isEmpty() ? null : department
        );
    }

    private synchronized String generateNextAssetTag() {
        Optional<Asset> lastAssetOpt = assetRepository.findFirstByOrderByIdDesc();
        if (lastAssetOpt.isEmpty()) {
            return "AF-0001";
        }
        
        String lastTag = lastAssetOpt.get().getAssetTag();
        try {
            if (lastTag.startsWith("AF-")) {
                int numericPart = Integer.parseInt(lastTag.substring(3));
                return String.format("AF-%04d", numericPart + 1);
            }
        } catch (NumberFormatException e) {
            // Fallback if tag was not formatted properly
        }
        
        // Generic fallback to ensure unique tag using DB id increment
        return String.format("AF-%04d", lastAssetOpt.get().getId() + 1);
    }
}

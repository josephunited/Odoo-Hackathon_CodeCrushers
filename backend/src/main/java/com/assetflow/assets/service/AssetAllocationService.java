package com.assetflow.assets.service;

import com.assetflow.assets.dto.AllocationRequestDto;
import com.assetflow.assets.dto.ReturnRequestDto;
import com.assetflow.assets.model.AllocationStatus;
import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetAllocation;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.repository.AssetAllocationRepository;
import com.assetflow.assets.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AssetAllocationService {

    private final AssetRepository assetRepository;
    private final AssetAllocationRepository allocationRepository;
    private final AssetHistoryService historyService;

    @Transactional
    public AssetAllocation allocateAsset(AllocationRequestDto request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + request.getAssetId()));

        // Prevent duplicate allocation
        if (asset.getStatus() == AssetStatus.ALLOCATED || 
            allocationRepository.existsByAssetAndStatus(asset, AllocationStatus.ACTIVE)) {
            // Throw ResponseStatusException with exactly the requested error message
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset already allocated.");
        }

        // Check if the asset is in a state that allows allocation (Available or Reserved)
        if (asset.getStatus() != AssetStatus.AVAILABLE && asset.getStatus() != AssetStatus.RESERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset is currently " + asset.getStatus() + " and cannot be allocated.");
        }

        AssetAllocation allocation = AssetAllocation.builder()
                .asset(asset)
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName() != null ? request.getEmployeeName() : "Employee #" + request.getEmployeeId())
                .allocatedBy(request.getAllocatedBy() != null ? request.getAllocatedBy() : "Admin")
                .allocationDate(LocalDate.now())
                .expectedReturnDate(request.getExpectedReturnDate())
                .status(AllocationStatus.ACTIVE)
                .build();

        AssetAllocation savedAllocation = allocationRepository.save(allocation);

        // Update asset status
        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepository.save(asset);

        // Log to history
        String historyDetails = String.format("Allocated to %s (ID: %d). Expected return date: %s", 
                allocation.getEmployeeName(), 
                allocation.getEmployeeId(), 
                allocation.getExpectedReturnDate() != null ? allocation.getExpectedReturnDate().toString() : "N/A");
        historyService.logHistory(asset, "ALLOCATION", allocation.getAllocatedBy(), historyDetails);

        return savedAllocation;
    }

    @Transactional
    public AssetAllocation returnAsset(ReturnRequestDto request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + request.getAssetId()));

        AssetAllocation allocation = allocationRepository.findByAssetAndStatus(asset, AllocationStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset is not currently active in any allocation."));

        // Update allocation record
        allocation.setActualReturnDate(LocalDate.now());
        allocation.setStatus(AllocationStatus.RETURNED);
        allocation.setReturnConditionNotes(request.getReturnConditionNotes());
        AssetAllocation updatedAllocation = allocationRepository.save(allocation);

        // Update asset condition if provided
        if (request.getActualCondition() != null) {
            asset.setAssetCondition(request.getActualCondition());
        }
        
        // Automatically change status back to Available
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        // Log to history
        String historyDetails = String.format("Returned by %s. Notes: %s. Condition on return: %s",
                allocation.getEmployeeName(),
                request.getReturnConditionNotes() != null ? request.getReturnConditionNotes() : "None",
                asset.getAssetCondition());
        historyService.logHistory(asset, "RETURN", request.getPerformedBy(), historyDetails);

        return updatedAllocation;
    }
}

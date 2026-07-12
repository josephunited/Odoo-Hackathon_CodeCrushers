package com.assetflow.assets.service;

import com.assetflow.assets.dto.TransferRequestDto;
import com.assetflow.assets.model.*;
import com.assetflow.assets.repository.AssetAllocationRepository;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.assets.repository.AssetTransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetTransferService {

    private final AssetRepository assetRepository;
    private final AssetAllocationRepository allocationRepository;
    private final AssetTransferRepository transferRepository;
    private final AssetHistoryService historyService;

    @Transactional
    public AssetTransfer requestTransfer(TransferRequestDto request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found with ID: " + request.getAssetId()));

        // Retrieve current active allocation to find "fromEmployee" details
        AssetAllocation activeAllocation = allocationRepository.findByAssetAndStatus(asset, AllocationStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Asset is not currently allocated to anyone. You can only request transfers for allocated assets."));

        AssetTransfer transfer = AssetTransfer.builder()
                .asset(asset)
                .fromEmployeeId(activeAllocation.getEmployeeId())
                .fromEmployeeName(activeAllocation.getEmployeeName())
                .toEmployeeId(request.getToEmployeeId())
                .toEmployeeName(request.getToEmployeeName() != null ? request.getToEmployeeName() : "Employee #" + request.getToEmployeeId())
                .requestedBy(request.getRequestedBy() != null ? request.getRequestedBy() : "Admin")
                .requestDate(LocalDate.now())
                .status(TransferStatus.PENDING)
                .remarks(request.getRemarks())
                .build();

        AssetTransfer savedTransfer = transferRepository.save(transfer);

        // Log history
        String historyDetails = String.format("Transfer requested from %s to %s. Remarks: %s", 
                transfer.getFromEmployeeName(), 
                transfer.getToEmployeeName(), 
                transfer.getRemarks() != null ? transfer.getRemarks() : "None");
        historyService.logHistory(asset, "TRANSFER_REQUEST", transfer.getRequestedBy(), historyDetails);

        return savedTransfer;
    }

    @Transactional
    public AssetTransfer processTransfer(Long transferId, boolean approve, String remarks, String processedBy) {
        AssetTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transfer request not found with ID: " + transferId));

        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer request is already processed. Current status: " + transfer.getStatus());
        }

        Asset asset = transfer.getAsset();
        transfer.setActionDate(LocalDate.now());
        transfer.setRemarks(remarks);

        if (approve) {
            transfer.setStatus(TransferStatus.APPROVED);

            // 1. Close current active allocation
            AssetAllocation currentAllocation = allocationRepository.findByAssetAndStatus(asset, AllocationStatus.ACTIVE)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No active allocation found for the asset."));
            currentAllocation.setStatus(AllocationStatus.RETURNED);
            currentAllocation.setActualReturnDate(LocalDate.now());
            currentAllocation.setReturnConditionNotes("Transferred to " + transfer.getToEmployeeName());
            allocationRepository.save(currentAllocation);

            // 2. Create new active allocation for target employee
            AssetAllocation newAllocation = AssetAllocation.builder()
                    .asset(asset)
                    .employeeId(transfer.getToEmployeeId())
                    .employeeName(transfer.getToEmployeeName())
                    .allocatedBy(processedBy != null ? processedBy : "System")
                    .allocationDate(LocalDate.now())
                    .status(AllocationStatus.ACTIVE)
                    .build();
            allocationRepository.save(newAllocation);

            // Make sure the asset remains in ALLOCATED status
            asset.setStatus(AssetStatus.ALLOCATED);
            assetRepository.save(asset);

            // 3. Log history
            String historyDetails = String.format("Transfer Approved: Transferred from %s to %s. Processed by: %s",
                    transfer.getFromEmployeeName(), transfer.getToEmployeeName(), processedBy);
            historyService.logHistory(asset, "TRANSFER_APPROVED", processedBy, historyDetails);

        } else {
            transfer.setStatus(TransferStatus.REJECTED);

            // Log history
            String historyDetails = String.format("Transfer Rejected. Processed by: %s. Reason: %s", 
                    processedBy, remarks != null ? remarks : "No reason provided");
            historyService.logHistory(asset, "TRANSFER_REJECTED", processedBy, historyDetails);
        }

        return transferRepository.save(transfer);
    }

    public List<AssetTransfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    public List<AssetTransfer> getTransfersByStatus(TransferStatus status) {
        return transferRepository.findByStatus(status);
    }
}

package com.assetflow.service;

import com.assetflow.dto.MaintenanceRequestDTO;
import com.assetflow.dto.MaintenanceResponseDTO;
import com.assetflow.entity.MaintenanceStatus;

import java.time.LocalDate;
import java.util.List;

public interface MaintenanceService {
    MaintenanceResponseDTO createRequest(MaintenanceRequestDTO dto);
    MaintenanceResponseDTO getById(Long id);
    List<MaintenanceResponseDTO> getAllRequests();
    List<MaintenanceResponseDTO> getRequestsByAsset(Long assetId);
    MaintenanceResponseDTO scheduleMaintenance(Long id, LocalDate scheduledDate);
    MaintenanceResponseDTO resolveMaintenance(Long id, String resolutionDetails, Double cost);
    MaintenanceResponseDTO updateStatus(Long id, MaintenanceStatus status);
    void deleteRequest(Long id);
}

package com.assetflow.controller;

import com.assetflow.dto.MaintenanceRequestDTO;
import com.assetflow.dto.MaintenanceResponseDTO;
import com.assetflow.entity.MaintenanceStatus;
import com.assetflow.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceResponseDTO> createRequest(@Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(maintenanceService.createRequest(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceResponseDTO>> getRequests(@RequestParam(required = false) Long assetId) {
        if (assetId != null) {
            return ResponseEntity.ok(maintenanceService.getRequestsByAsset(assetId));
        }
        return ResponseEntity.ok(maintenanceService.getAllRequests());
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<MaintenanceResponseDTO> scheduleMaintenance(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(maintenanceService.scheduleMaintenance(id, date));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<MaintenanceResponseDTO> resolveMaintenance(
            @PathVariable Long id,
            @RequestParam String resolution,
            @RequestParam Double cost) {
        return ResponseEntity.ok(maintenanceService.resolveMaintenance(id, resolution, cost));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status) {
        return ResponseEntity.ok(maintenanceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        maintenanceService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}

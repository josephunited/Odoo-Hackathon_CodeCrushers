package com.assetflow.controller;

import com.assetflow.dto.MaintenanceRequestDto;
import com.assetflow.entity.MaintenanceRequest;
import com.assetflow.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceRequest> report(@Valid @RequestBody MaintenanceRequestDto request) {
        return ResponseEntity.ok(maintenanceService.reportMaintenance(request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<MaintenanceRequest> complete(@PathVariable Long id, @RequestParam Double cost) {
        return ResponseEntity.ok(maintenanceService.completeMaintenance(id, cost));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAll() {
        return ResponseEntity.ok(maintenanceService.getAll());
    }
}

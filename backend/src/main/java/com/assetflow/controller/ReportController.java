package com.assetflow.controller;

import com.assetflow.dto.ReportDTO;
import com.assetflow.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /** GET /api/reports/assets — Full asset summary report */
    @GetMapping("/assets")
    public ResponseEntity<ReportDTO> assetSummary() {
        return ResponseEntity.ok(reportService.getAssetSummaryReport());
    }

    /** GET /api/reports/allocations — Allocation report with overdue detection */
    @GetMapping("/allocations")
    public ResponseEntity<ReportDTO> allocationReport() {
        return ResponseEntity.ok(reportService.getAllocationReport());
    }

    /** GET /api/reports/audits — Audit summary with per-cycle verification rates */
    @GetMapping("/audits")
    public ResponseEntity<ReportDTO> auditSummary() {
        return ResponseEntity.ok(reportService.getAuditSummaryReport());
    }

    /** GET /api/reports/maintenance — Maintenance events from AssetHistory */
    @GetMapping("/maintenance")
    public ResponseEntity<ReportDTO> maintenanceReport() {
        return ResponseEntity.ok(reportService.getMaintenanceReport());
    }
}

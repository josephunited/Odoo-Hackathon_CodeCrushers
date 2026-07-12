package com.assetflow.service;

import com.assetflow.dto.ReportDTO;

/**
 * Report generation service.
 * Each method assembles its own ReportDTO from the existing repositories
 * without touching other teams' service layers.
 */
public interface ReportService {

    /** Full asset catalogue with breakdowns by status / category / location / condition */
    ReportDTO getAssetSummaryReport();

    /** All allocations (active + historical) with overdue detection */
    ReportDTO getAllocationReport();

    /** All audit cycles with per-cycle verification rates and discrepancy counts */
    ReportDTO getAuditSummaryReport();

    /** Maintenance events sourced from AssetHistory action types */
    ReportDTO getMaintenanceReport();
}

package com.assetflow.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Umbrella DTO returned by all report endpoints.
 * Fields are populated selectively per report type — unused fields remain null.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {

    /** Which report this payload represents */
    private String reportType;

    /** Generation timestamp */
    private LocalDate generatedOn;

    // ── Asset Summary ─────────────────────────────────────────────────────────
    private Long totalAssets;
    private BigDecimal totalAssetValue;
    private Map<String, Long>        assetsByStatus;
    private Map<String, Long>        assetsByCategory;
    private Map<String, Long>        assetsByLocation;
    private Map<String, Long>        assetsByCondition;
    private List<AssetReportRowDTO>  assetRows;

    // ── Allocation Report ─────────────────────────────────────────────────────
    private Long totalAllocations;
    private Long activeAllocations;
    private Long returnedAllocations;
    private Long overdueAllocations;
    private List<AllocationReportRowDTO> allocationRows;

    // ── Audit Summary ─────────────────────────────────────────────────────────
    private Long totalAuditCycles;
    private Long completedAuditCycles;
    private Long activeAuditCycles;
    private Double averageVerificationRate;
    private List<AuditReportRowDTO> auditRows;

    // ── Maintenance Report ────────────────────────────────────────────────────
    private Long totalMaintenanceTickets;
    private Long openTickets;
    private Long closedTickets;
    private List<MaintenanceReportRowDTO> maintenanceRows;

    // ─────────────────────────────────────────────────────────────────────────

    /** Row DTO for asset summary report */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AssetReportRowDTO {
        private Long       id;
        private String     assetTag;
        private String     name;
        private String     category;
        private String     status;
        private String     condition;
        private String     location;
        private LocalDate  purchaseDate;
        private BigDecimal purchaseCost;
    }

    /** Row DTO for allocation report */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AllocationReportRowDTO {
        private Long      id;
        private String    assetTag;
        private String    assetName;
        private Long      employeeId;
        private String    employeeName;
        private String    allocatedBy;
        private LocalDate allocationDate;
        private LocalDate expectedReturnDate;
        private LocalDate actualReturnDate;
        private String    status;
        private boolean   overdue;
    }

    /** Row DTO for audit summary report */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuditReportRowDTO {
        private Long      id;
        private String    name;
        private String    status;
        private String    auditorName;
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalDate completedDate;
        private int       totalAssets;
        private int       verified;
        private int       missing;
        private int       damaged;
        private int       pending;
        private double    verificationRate;
    }

    /** Row DTO for maintenance report */
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MaintenanceReportRowDTO {
        private String actionType;
        private String assetTag;
        private String assetName;
        private String performedBy;
        private String details;
        private String actionDate;
    }
}

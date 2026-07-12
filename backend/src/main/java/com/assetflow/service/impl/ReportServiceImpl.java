package com.assetflow.service.impl;

import com.assetflow.assets.model.*;
import com.assetflow.assets.repository.AssetAllocationRepository;
import com.assetflow.assets.repository.AssetHistoryRepository;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.dto.ReportDTO;
import com.assetflow.dto.ReportDTO.*;
import com.assetflow.entity.Audit;
import com.assetflow.entity.AuditItem;
import com.assetflow.repository.AuditRepository;
import com.assetflow.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final AssetRepository             assetRepository;
    private final AssetAllocationRepository   allocationRepository;
    private final AssetHistoryRepository      historyRepository;
    private final AuditRepository             auditRepository;

    // ── 1. Asset Summary ──────────────────────────────────────────────────────

    @Override
    public ReportDTO getAssetSummaryReport() {
        List<Asset> assets = assetRepository.findAll();

        BigDecimal totalValue = assets.stream()
                .map(a -> a.getPurchaseCost() != null ? a.getPurchaseCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byStatus = assets.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        Map<String, Long> byCategory = assets.stream()
                .collect(Collectors.groupingBy(Asset::getCategory, Collectors.counting()));

        Map<String, Long> byLocation = assets.stream()
                .collect(Collectors.groupingBy(Asset::getLocation, Collectors.counting()));

        Map<String, Long> byCondition = assets.stream()
                .collect(Collectors.groupingBy(a -> a.getAssetCondition().name(), Collectors.counting()));

        List<AssetReportRowDTO> rows = assets.stream()
                .map(a -> AssetReportRowDTO.builder()
                        .id(a.getId())
                        .assetTag(a.getAssetTag())
                        .name(a.getName())
                        .category(a.getCategory())
                        .status(a.getStatus().name())
                        .condition(a.getAssetCondition().name())
                        .location(a.getLocation())
                        .purchaseDate(a.getPurchaseDate())
                        .purchaseCost(a.getPurchaseCost())
                        .build())
                .collect(Collectors.toList());

        return ReportDTO.builder()
                .reportType("ASSET_SUMMARY")
                .generatedOn(LocalDate.now())
                .totalAssets((long) assets.size())
                .totalAssetValue(totalValue)
                .assetsByStatus(byStatus)
                .assetsByCategory(byCategory)
                .assetsByLocation(byLocation)
                .assetsByCondition(byCondition)
                .assetRows(rows)
                .build();
    }

    // ── 2. Allocation Report ──────────────────────────────────────────────────

    @Override
    public ReportDTO getAllocationReport() {
        List<AssetAllocation> allocations = allocationRepository.findAll();
        LocalDate today = LocalDate.now();

        long active   = allocations.stream().filter(a -> a.getStatus() == AllocationStatus.ACTIVE).count();
        long returned = allocations.stream().filter(a -> a.getStatus() == AllocationStatus.RETURNED).count();
        long overdue  = allocations.stream()
                .filter(a -> a.getStatus() == AllocationStatus.ACTIVE
                        && a.getExpectedReturnDate() != null
                        && a.getExpectedReturnDate().isBefore(today))
                .count();

        List<AllocationReportRowDTO> rows = allocations.stream()
                .sorted(Comparator.comparing(AssetAllocation::getAllocationDate).reversed())
                .map(a -> {
                    boolean isOverdue = a.getStatus() == AllocationStatus.ACTIVE
                            && a.getExpectedReturnDate() != null
                            && a.getExpectedReturnDate().isBefore(today);
                    return AllocationReportRowDTO.builder()
                            .id(a.getId())
                            .assetTag(a.getAsset().getAssetTag())
                            .assetName(a.getAsset().getName())
                            .employeeId(a.getEmployeeId())
                            .employeeName(a.getEmployeeName())
                            .allocatedBy(a.getAllocatedBy())
                            .allocationDate(a.getAllocationDate())
                            .expectedReturnDate(a.getExpectedReturnDate())
                            .actualReturnDate(a.getActualReturnDate())
                            .status(a.getStatus().name())
                            .overdue(isOverdue)
                            .build();
                })
                .collect(Collectors.toList());

        return ReportDTO.builder()
                .reportType("ALLOCATION")
                .generatedOn(LocalDate.now())
                .totalAllocations((long) allocations.size())
                .activeAllocations(active)
                .returnedAllocations(returned)
                .overdueAllocations(overdue)
                .allocationRows(rows)
                .build();
    }

    // ── 3. Audit Summary ──────────────────────────────────────────────────────

    @Override
    public ReportDTO getAuditSummaryReport() {
        List<Audit> audits = auditRepository.findAllByOrderByCreatedDateDesc();

        long completed = audits.stream().filter(a -> a.getStatus().name().equals("COMPLETED")).count();
        long active    = audits.stream().filter(a -> a.getStatus().name().equals("ACTIVE")).count();

        List<AuditReportRowDTO> rows = audits.stream().map(audit -> {
            List<AuditItem> items = audit.getAuditItems();
            int total    = items.size();
            int verified = (int) items.stream().filter(i -> i.getStatus().name().equals("VERIFIED")).count();
            int missing  = (int) items.stream().filter(i -> i.getStatus().name().equals("MISSING")).count();
            int damaged  = (int) items.stream().filter(i -> i.getStatus().name().equals("DAMAGED")).count();
            int pending  = (int) items.stream().filter(i -> i.getStatus().name().equals("PENDING")).count();
            double rate  = total > 0 ? (verified * 100.0 / total) : 0.0;

            return AuditReportRowDTO.builder()
                    .id(audit.getId())
                    .name(audit.getName())
                    .status(audit.getStatus().name())
                    .auditorName(audit.getAuditorName())
                    .startDate(audit.getStartDate())
                    .endDate(audit.getEndDate())
                    .completedDate(audit.getCompletedDate())
                    .totalAssets(total)
                    .verified(verified)
                    .missing(missing)
                    .damaged(damaged)
                    .pending(pending)
                    .verificationRate(Math.round(rate * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        double avgRate = rows.isEmpty() ? 0.0
                : rows.stream().mapToDouble(AuditReportRowDTO::getVerificationRate).average().orElse(0.0);

        return ReportDTO.builder()
                .reportType("AUDIT_SUMMARY")
                .generatedOn(LocalDate.now())
                .totalAuditCycles((long) audits.size())
                .completedAuditCycles(completed)
                .activeAuditCycles(active)
                .averageVerificationRate(Math.round(avgRate * 10.0) / 10.0)
                .auditRows(rows)
                .build();
    }

    // ── 4. Maintenance Report ─────────────────────────────────────────────────

    @Override
    public ReportDTO getMaintenanceReport() {
        // Read from AssetHistory — Sooraj's table — filtering by maintenance-type action codes
        List<AssetHistory> history = historyRepository.findAll();

        List<AssetHistory> maintenanceEvents = history.stream()
                .filter(h -> h.getActionType() != null && (
                        h.getActionType().startsWith("MAINTENANCE") ||
                        h.getActionType().equals("REPAIR") ||
                        h.getActionType().equals("SERVICED") ||
                        h.getActionType().equals("AUDIT_DAMAGED")
                ))
                .sorted(Comparator.comparing(AssetHistory::getActionDate).reversed())
                .collect(Collectors.toList());

        long open   = maintenanceEvents.stream().filter(h -> h.getActionType().endsWith("OPEN") || h.getActionType().endsWith("OPENED")).count();
        long closed = maintenanceEvents.stream().filter(h -> h.getActionType().endsWith("CLOSED") || h.getActionType().endsWith("RESOLVED")).count();

        List<MaintenanceReportRowDTO> rows = maintenanceEvents.stream()
                .map(h -> MaintenanceReportRowDTO.builder()
                        .actionType(h.getActionType())
                        .assetTag(h.getAsset() != null ? h.getAsset().getAssetTag() : "—")
                        .assetName(h.getAsset() != null ? h.getAsset().getName() : "—")
                        .performedBy(h.getPerformedBy())
                        .details(h.getDetails())
                        .actionDate(h.getActionDate() != null ? h.getActionDate().toString() : "—")
                        .build())
                .collect(Collectors.toList());

        return ReportDTO.builder()
                .reportType("MAINTENANCE")
                .generatedOn(LocalDate.now())
                .totalMaintenanceTickets((long) maintenanceEvents.size())
                .openTickets(open)
                .closedTickets(closed)
                .maintenanceRows(rows)
                .build();
    }
}

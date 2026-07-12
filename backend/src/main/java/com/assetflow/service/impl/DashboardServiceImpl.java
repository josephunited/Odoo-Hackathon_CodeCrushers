package com.assetflow.service.impl;

import com.assetflow.dto.DashboardDTO;
import com.assetflow.dto.RecentActivityDTO;
import com.assetflow.entity.ActivityLog;
import com.assetflow.repository.ActivityLogRepository;
import com.assetflow.service.DashboardService;
import com.assetflow.repository.EmployeeRepository;
import com.assetflow.repository.DepartmentRepository;
import com.assetflow.repository.CategoryRepository;
import com.assetflow.repository.BookingRepository;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.assets.repository.AssetTransferRepository;
import com.assetflow.assets.repository.AssetHistoryRepository;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.model.AssetHistory;
import com.assetflow.assets.model.TransferStatus;
import com.assetflow.entity.BookingStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final BookingRepository bookingRepository;
    private final AssetRepository assetRepository;
    private final AssetTransferRepository assetTransferRepository;
    private final AssetHistoryRepository assetHistoryRepository;
    private final ActivityLogRepository activityLogRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public DashboardDTO getDashboardSummary() {
        long totalAssets = assetRepository.count();
        
        // Count assets by specific statuses
        long availableAssets = getAssetCountByStatus(AssetStatus.AVAILABLE);
        long allocatedAssets = getAssetCountByStatus(AssetStatus.ALLOCATED);
        long underMaintenanceAssets = getAssetCountByStatus(AssetStatus.UNDER_MAINTENANCE);

        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalCategories = categoryRepository.count();

        // Pending transfers count using EntityManager for efficiency and safety
        long pendingTransfers = entityManager.createQuery(
                "SELECT COUNT(t) FROM AssetTransfer t WHERE t.status = :status", Long.class)
                .setParameter("status", TransferStatus.PENDING)
                .getSingleResult();

        // Active bookings count using our custom query
        long activeBookings = bookingRepository.countActiveBookings(BookingStatus.APPROVED, LocalDateTime.now());

        // Total asset purchase value sum
        BigDecimal totalValue = entityManager.createQuery(
                "SELECT SUM(a.purchaseCost) FROM Asset a", BigDecimal.class)
                .getSingleResult();
        if (totalValue == null) {
            totalValue = BigDecimal.ZERO;
        }

        // Assets grouped by status for charts
        List<Object[]> statusCounts = entityManager.createQuery(
                "SELECT a.status, COUNT(a) FROM Asset a GROUP BY a.status", Object[].class)
                .getResultList();
        Map<String, Long> assetsByStatus = new HashMap<>();
        for (Object[] result : statusCounts) {
            if (result[0] != null) {
                assetsByStatus.put(result[0].toString(), (Long) result[1]);
            }
        }

        // Assets grouped by category for charts
        List<Object[]> categoryCounts = entityManager.createQuery(
                "SELECT a.category, COUNT(a) FROM Asset a GROUP BY a.category", Object[].class)
                .getResultList();
        Map<String, Long> assetsByCategory = new HashMap<>();
        for (Object[] result : categoryCounts) {
            if (result[0] != null) {
                assetsByCategory.put(result[0].toString(), (Long) result[1]);
            }
        }

        // Fetch recent activities (limit 5 for dashboard overview)
        List<RecentActivityDTO> recentActivities = getRecentActivities(5);

        return DashboardDTO.builder()
                .totalAssets(totalAssets)
                .availableAssets(availableAssets)
                .allocatedAssets(allocatedAssets)
                .underMaintenanceAssets(underMaintenanceAssets)
                .totalEmployees(totalEmployees)
                .totalDepartments(totalDepartments)
                .totalCategories(totalCategories)
                .pendingTransfers(pendingTransfers)
                .activeBookings(activeBookings)
                .totalAssetValue(totalValue)
                .assetsByStatus(assetsByStatus)
                .assetsByCategory(assetsByCategory)
                .recentActivities(recentActivities)
                .build();
    }

    @Override
    public List<RecentActivityDTO> getRecentActivities(int limit) {
        // Read from the unified ActivityLog table — covers ALL modules (Audit, Asset, Booking, Maintenance)
        List<ActivityLog> logs = activityLogRepository.findTop20ByOrderByTimestampDesc()
                .stream().limit(limit).collect(Collectors.toList());

        if (!logs.isEmpty()) {
            return logs.stream()
                    .map(log -> RecentActivityDTO.builder()
                            .id(log.getId())
                            .assetTag(log.getEntityName() != null ? log.getEntityName() : log.getModule())
                            .assetName(log.getDescription())
                            .actionType(log.getActionType())
                            .performedBy(log.getActorUsername())
                            .details(log.getDescription())
                            .actionDate(log.getTimestamp())
                            .build())
                    .collect(Collectors.toList());
        }

        // Fallback: if ActivityLog table is empty, read from AssetHistory
        List<AssetHistory> histories = entityManager.createQuery(
                "SELECT h FROM AssetHistory h JOIN FETCH h.asset ORDER BY h.actionDate DESC", AssetHistory.class)
                .setMaxResults(limit)
                .getResultList();

        return histories.stream()
                .map(h -> RecentActivityDTO.builder()
                        .id(h.getId())
                        .assetTag(h.getAsset().getAssetTag())
                        .assetName(h.getAsset().getName())
                        .actionType(h.getActionType())
                        .performedBy(h.getPerformedBy())
                        .details(h.getDetails())
                        .actionDate(h.getActionDate())
                        .build())
                .collect(Collectors.toList());
    }

    private long getAssetCountByStatus(AssetStatus status) {
        return entityManager.createQuery(
                "SELECT COUNT(a) FROM Asset a WHERE a.status = :status", Long.class)
                .setParameter("status", status)
                .getSingleResult();
    }
}

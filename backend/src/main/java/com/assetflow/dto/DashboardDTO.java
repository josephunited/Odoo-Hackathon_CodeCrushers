package com.assetflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private long totalAssets;
    private long availableAssets;
    private long allocatedAssets;
    private long underMaintenanceAssets;
    
    private long totalEmployees;
    private long totalDepartments;
    private long totalCategories;
    
    private long pendingTransfers;
    private long activeBookings;
    
    private BigDecimal totalAssetValue;
    
    private Map<String, Long> assetsByStatus;
    private Map<String, Long> assetsByCategory;
    
    private List<RecentActivityDTO> recentActivities;
}

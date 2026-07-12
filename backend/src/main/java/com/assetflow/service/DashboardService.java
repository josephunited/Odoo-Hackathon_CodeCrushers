package com.assetflow.service;

import com.assetflow.dto.DashboardDTO;
import com.assetflow.dto.RecentActivityDTO;
import java.util.List;

public interface DashboardService {
    DashboardDTO getDashboardSummary();
    List<RecentActivityDTO> getRecentActivities(int limit);
}

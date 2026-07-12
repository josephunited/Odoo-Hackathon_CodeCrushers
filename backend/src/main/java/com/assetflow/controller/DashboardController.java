package com.assetflow.controller;

import com.assetflow.dto.DashboardDTO;
import com.assetflow.dto.RecentActivityDTO;
import com.assetflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor

public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivities(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getRecentActivities(limit));
    }
}

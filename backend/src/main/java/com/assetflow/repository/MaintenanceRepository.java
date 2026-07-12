package com.assetflow.repository;

import com.assetflow.entity.MaintenanceRequest;
import com.assetflow.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);
    List<MaintenanceRequest> findByAssetIdOrderByReportDateDesc(Long assetId);
}

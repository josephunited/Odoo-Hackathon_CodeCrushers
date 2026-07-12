package com.assetflow.repository;

import com.assetflow.entity.Maintenance;
import com.assetflow.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByAssetId(Long assetId);
    List<Maintenance> findByStatus(MaintenanceStatus status);
}

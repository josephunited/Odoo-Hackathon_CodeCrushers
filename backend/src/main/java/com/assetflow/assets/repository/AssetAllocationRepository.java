package com.assetflow.assets.repository;

import com.assetflow.assets.model.AllocationStatus;
import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    
    Optional<AssetAllocation> findByAssetAndStatus(Asset asset, AllocationStatus status);
    
    List<AssetAllocation> findByAssetIdOrderByAllocationDateDesc(Long assetId);
    
    boolean existsByAssetAndStatus(Asset asset, AllocationStatus status);
}

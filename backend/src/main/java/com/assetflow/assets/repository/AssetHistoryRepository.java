package com.assetflow.assets.repository;

import com.assetflow.assets.model.AssetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetHistoryRepository extends JpaRepository<AssetHistory, Long> {
    
    List<AssetHistory> findByAssetIdOrderByActionDateDesc(Long assetId);
}

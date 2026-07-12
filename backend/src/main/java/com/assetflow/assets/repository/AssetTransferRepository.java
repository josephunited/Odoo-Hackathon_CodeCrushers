package com.assetflow.assets.repository;

import com.assetflow.assets.model.AssetTransfer;
import com.assetflow.assets.model.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetTransferRepository extends JpaRepository<AssetTransfer, Long> {
    
    List<AssetTransfer> findByStatus(TransferStatus status);
    
    List<AssetTransfer> findByAssetIdOrderByRequestDateDesc(Long assetId);
}

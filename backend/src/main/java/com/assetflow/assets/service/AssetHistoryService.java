package com.assetflow.assets.service;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetHistory;
import com.assetflow.assets.repository.AssetHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetHistoryService {

    private final AssetHistoryRepository historyRepository;

    @Transactional
    public void logHistory(Asset asset, String actionType, String performedBy, String details) {
        AssetHistory history = AssetHistory.builder()
                .asset(asset)
                .actionType(actionType)
                .actionDate(LocalDateTime.now())
                .performedBy(performedBy != null ? performedBy : "System")
                .details(details)
                .build();
        historyRepository.save(history);
    }

    public List<AssetHistory> getHistoryForAsset(Long assetId) {
        return historyRepository.findByAssetIdOrderByActionDateDesc(assetId);
    }
}

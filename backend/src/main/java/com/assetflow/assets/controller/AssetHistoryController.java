package com.assetflow.assets.controller;

import com.assetflow.assets.model.AssetHistory;
import com.assetflow.assets.service.AssetHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
public class AssetHistoryController {

    private final AssetHistoryService historyService;

    @GetMapping("/{id}/history")
    public ResponseEntity<List<AssetHistory>> getAssetHistory(@PathVariable Long id) {
        List<AssetHistory> history = historyService.getHistoryForAsset(id);
        return ResponseEntity.ok(history);
    }
}

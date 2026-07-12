package com.assetflow.assets.controller;

import com.assetflow.assets.dto.AssetDto;
import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody AssetDto assetDto) {
        Asset created = assetService.createAsset(assetDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAssets(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String serial,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String department) {
        
        List<Asset> assets = assetService.searchAssets(tag, serial, category, status, location, department);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        Asset asset = assetService.getAssetById(id);
        return ResponseEntity.ok(asset);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetDto assetDto) {
        Asset updated = assetService.updateAsset(id, assetDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}

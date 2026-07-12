package com.assetflow.assets.controller;

import com.assetflow.assets.dto.AllocationRequestDto;
import com.assetflow.assets.dto.ReturnRequestDto;
import com.assetflow.assets.model.AssetAllocation;
import com.assetflow.assets.service.AssetAllocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
public class AssetAllocationController {

    private final AssetAllocationService allocationService;

    @PostMapping("/allocate")
    public ResponseEntity<AssetAllocation> allocateAsset(@Valid @RequestBody AllocationRequestDto requestDto) {
        AssetAllocation allocation = allocationService.allocateAsset(requestDto);
        return ResponseEntity.ok(allocation);
    }

    @PostMapping("/return")
    public ResponseEntity<AssetAllocation> returnAsset(@Valid @RequestBody ReturnRequestDto requestDto) {
        AssetAllocation allocation = allocationService.returnAsset(requestDto);
        return ResponseEntity.ok(allocation);
    }
}

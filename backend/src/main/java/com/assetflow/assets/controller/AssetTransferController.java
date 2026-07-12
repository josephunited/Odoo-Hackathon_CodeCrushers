package com.assetflow.assets.controller;

import com.assetflow.assets.dto.TransferRequestDto;
import com.assetflow.assets.model.AssetTransfer;
import com.assetflow.assets.model.TransferStatus;
import com.assetflow.assets.service.AssetTransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assets/transfer")
@RequiredArgsConstructor
public class AssetTransferController {

    private final AssetTransferService transferService;

    @PostMapping
    public ResponseEntity<AssetTransfer> requestTransfer(@Valid @RequestBody TransferRequestDto requestDto) {
        AssetTransfer transfer = transferService.requestTransfer(requestDto);
        return ResponseEntity.ok(transfer);
    }

    @PostMapping("/process")
    public ResponseEntity<AssetTransfer> processTransfer(@RequestBody TransferRequestDto requestDto) {
        AssetTransfer processed = transferService.processTransfer(
                requestDto.getTransferId(),
                requestDto.isApproved(),
                requestDto.getRemarks(),
                requestDto.getProcessedBy()
        );
        return ResponseEntity.ok(processed);
    }

    @GetMapping
    public ResponseEntity<List<AssetTransfer>> getTransfers(@RequestParam(required = false) TransferStatus status) {
        List<AssetTransfer> transfers;
        if (status != null) {
            transfers = transferService.getTransfersByStatus(status);
        } else {
            transfers = transferService.getAllTransfers();
        }
        return ResponseEntity.ok(transfers);
    }
}

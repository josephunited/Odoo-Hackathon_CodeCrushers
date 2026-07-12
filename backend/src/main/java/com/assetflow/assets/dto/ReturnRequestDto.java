package com.assetflow.assets.dto;

import com.assetflow.assets.model.AssetCondition;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestDto {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    private String returnConditionNotes;
    
    // Optional: if the physical condition of the asset changed upon return
    private AssetCondition actualCondition;
    
    private String performedBy;
}

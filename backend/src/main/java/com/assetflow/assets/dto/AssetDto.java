package com.assetflow.assets.dto;

import com.assetflow.assets.model.AssetCondition;
import com.assetflow.assets.model.AssetStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDto {

    private Long id;
    private String assetTag;

    @NotBlank(message = "Asset name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Purchase cost is required")
    private BigDecimal purchaseCost;

    @NotNull(message = "Condition is required")
    private AssetCondition assetCondition;

    @NotBlank(message = "Location is required")
    private String location;

    private boolean sharedBookable;
    private AssetStatus status;
    private String imageUrl;
}

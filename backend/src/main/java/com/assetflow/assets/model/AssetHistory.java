package com.assetflow.assets.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @NotBlank(message = "Action type is required")
    @Column(name = "action_type", nullable = false)
    private String actionType;

    @NotNull(message = "Action date is required")
    @Column(name = "action_date", nullable = false)
    private LocalDateTime actionDate;

    @Column(name = "performed_by")
    private String performedBy;

    @NotBlank(message = "Details are required")
    @Column(nullable = false, length = 1000)
    private String details;
}

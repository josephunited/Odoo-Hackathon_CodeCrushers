package com.assetflow.entity;

import com.assetflow.assets.model.Asset;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @NotNull(message = "Reported by employee is required")
    @Column(name = "reported_by", nullable = false)
    private Long reportedBy;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "cost")
    private Double cost;

    @Column(name = "report_date")
    private LocalDate reportDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;
}

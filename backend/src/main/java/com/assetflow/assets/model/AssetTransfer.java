package com.assetflow.assets.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "asset_transfers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @NotNull(message = "From Employee ID is required")
    @Column(name = "from_employee_id", nullable = false)
    private Long fromEmployeeId;

    @Column(name = "from_employee_name")
    private String fromEmployeeName;

    @NotNull(message = "To Employee ID is required")
    @Column(name = "to_employee_id", nullable = false)
    private Long toEmployeeId;

    @Column(name = "to_employee_name")
    private String toEmployeeName;

    @Column(name = "requested_by")
    private String requestedBy;

    @NotNull(message = "Request date is required")
    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @NotNull(message = "Transfer status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status;

    @Column(name = "action_date")
    private LocalDate actionDate;

    @Column(length = 1000)
    private String remarks;
}

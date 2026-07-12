package com.assetflow.assets.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "asset_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @NotNull(message = "Employee ID is required")
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "allocated_by")
    private String allocatedBy;

    @NotNull(message = "Allocation date is required")
    @Column(name = "allocation_date", nullable = false)
    private LocalDate allocationDate;

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Column(name = "actual_return_date")
    private LocalDate actualReturnDate;

    @Column(name = "return_condition_notes", length = 1000)
    private String returnConditionNotes;

    @NotNull(message = "Allocation status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationStatus status;
}

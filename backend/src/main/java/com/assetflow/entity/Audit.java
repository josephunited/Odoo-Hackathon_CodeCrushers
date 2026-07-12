package com.assetflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "audits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "auditItems")
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditStatus status;

    @Column(name = "auditor_id")
    private Long auditorId;

    @Column(name = "auditor_name", length = 100)
    private String auditorName;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @OneToMany(mappedBy = "audit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AuditItem> auditItems = new ArrayList<>();
}

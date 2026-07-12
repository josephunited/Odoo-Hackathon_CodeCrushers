package com.assetflow.repository;

import com.assetflow.entity.Audit;
import com.assetflow.entity.AuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {
    
    Optional<Audit> findByStatus(AuditStatus status);
    
    List<Audit> findAllByOrderByCreatedDateDesc();
}

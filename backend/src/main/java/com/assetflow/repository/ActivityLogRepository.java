package com.assetflow.repository;

import com.assetflow.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** Most-recent N logs across all modules — used by dashboard feed */
    List<ActivityLog> findTop20ByOrderByTimestampDesc();

    /** Paginated full log with optional filters */
    @Query("""
        SELECT a FROM ActivityLog a
        WHERE (:module      IS NULL OR a.module      = :module)
          AND (:actorUsername IS NULL OR a.actorUsername = :actorUsername)
          AND (:actionType  IS NULL OR a.actionType  = :actionType)
          AND (:from        IS NULL OR a.timestamp  >= :from)
          AND (:to          IS NULL OR a.timestamp  <= :to)
          AND (:search      IS NULL OR LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%'))
                                    OR LOWER(a.entityName)  LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY a.timestamp DESC
        """)
    Page<ActivityLog> findFiltered(
        @Param("module")       String module,
        @Param("actorUsername") String actorUsername,
        @Param("actionType")   String actionType,
        @Param("from")         LocalDateTime from,
        @Param("to")           LocalDateTime to,
        @Param("search")       String search,
        Pageable pageable
    );

    /** Distinct actor names for filter dropdown */
    @Query("SELECT DISTINCT a.actorUsername FROM ActivityLog a WHERE a.actorUsername IS NOT NULL ORDER BY a.actorUsername")
    List<String> findDistinctActors();

    /** Distinct module names for filter dropdown */
    @Query("SELECT DISTINCT a.module FROM ActivityLog a ORDER BY a.module")
    List<String> findDistinctModules();
}

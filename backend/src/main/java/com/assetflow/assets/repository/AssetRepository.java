package com.assetflow.assets.repository;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByAssetTag(String assetTag);
    
    Optional<Asset> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);

    Optional<Asset> findFirstByOrderByIdDesc();

    @Query("SELECT DISTINCT a FROM Asset a " +
           "LEFT JOIN AssetAllocation aa ON aa.asset = a AND aa.status = 'ACTIVE' " +
           "WHERE (:tag IS NULL OR LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :tag, '%'))) " +
           "AND (:serial IS NULL OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :serial, '%'))) " +
           "AND (:category IS NULL OR LOWER(a.category) = LOWER(:category)) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:location IS NULL OR LOWER(a.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:department IS NULL OR LOWER(aa.employeeName) LIKE LOWER(CONCAT('%', :department, '%')))") // Assuming employee details/dep could match name or mock filter
    List<Asset> searchAssets(
            @Param("tag") String tag,
            @Param("serial") String serial,
            @Param("category") String category,
            @Param("status") AssetStatus status,
            @Param("location") String location,
            @Param("department") String department
    );
}

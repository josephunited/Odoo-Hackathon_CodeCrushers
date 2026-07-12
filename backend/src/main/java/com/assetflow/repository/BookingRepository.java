package com.assetflow.repository;

import com.assetflow.entity.Booking;
import com.assetflow.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Collection;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND :now BETWEEN b.startTime AND b.endTime")
    long countActiveBookings(@Param("status") BookingStatus status, @Param("now") LocalDateTime now);

    List<Booking> findByEmployeeId(Long employeeId);

    List<Booking> findByAssetId(Long assetId);
    
    java.util.List<Booking> findByEmployeeIdOrderByStartTimeDesc(Long employeeId);

    @Query("SELECT b FROM Booking b WHERE b.asset.id = :assetId " +
           "AND b.status IN :statuses " +
           "AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId) " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("assetId") Long assetId,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    @Query("SELECT b FROM Booking b WHERE b.asset.id = :assetId AND b.status IN :statuses AND (b.startTime < :endTime AND b.endTime > :startTime)")
    java.util.List<Booking> findOverlappingBookingsSimple(
            @Param("assetId") Long assetId,
            @Param("statuses") java.util.List<BookingStatus> statuses,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}

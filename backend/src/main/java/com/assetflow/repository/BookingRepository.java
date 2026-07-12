package com.assetflow.repository;

import com.assetflow.entity.Booking;
import com.assetflow.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND :now BETWEEN b.startTime AND b.endTime")
    long countActiveBookings(@Param("status") BookingStatus status, @Param("now") LocalDateTime now);
}

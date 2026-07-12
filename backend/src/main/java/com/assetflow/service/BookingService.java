package com.assetflow.service;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.model.AssetStatus;
import com.assetflow.assets.repository.AssetRepository;
import com.assetflow.dto.BookingRequestDto;
import com.assetflow.entity.Booking;
import com.assetflow.entity.BookingStatus;
import com.assetflow.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AssetRepository assetRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public Booking createBooking(BookingRequestDto request) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (!asset.isSharedBookable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset is not a shared resource");
        }

        if (asset.getStatus() == AssetStatus.UNDER_MAINTENANCE || asset.getStatus() == AssetStatus.ALLOCATED || asset.getStatus() == AssetStatus.RETIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset cannot be booked due to its current status: " + asset.getStatus());
        }

        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.APPROVED, BookingStatus.PENDING);
        List<Booking> overlapping = bookingRepository.findOverlappingBookingsSimple(asset.getId(), activeStatuses, request.getStartTime(), request.getEndTime());
        
        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Asset is already booked for this time period");
        }

        Booking booking = Booking.builder()
                .asset(asset)
                .employeeId(request.getEmployeeId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .status(BookingStatus.APPROVED) // Auto-approve as per MVP spec
                .build();

        Booking saved = bookingRepository.save(booking);

        activityLogService.log("BOOKING", "CREATED", "Booked " + asset.getName(), "Employee #" + request.getEmployeeId(), "Booking", saved.getId(), "Booking-" + saved.getId());

        return saved;
    }

    public List<Booking> getBookingsByEmployee(Long employeeId) {
        return bookingRepository.findByEmployeeIdOrderByStartTimeDesc(employeeId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, Long employeeId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getEmployeeId().equals(employeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        activityLogService.log("BOOKING", "CANCELLED", "Cancelled booking for " + booking.getAsset().getName(), "Employee #" + employeeId, "Booking", updated.getId(), "Booking-" + updated.getId());

        return updated;
    }
}

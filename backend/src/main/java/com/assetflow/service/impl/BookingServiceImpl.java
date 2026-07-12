package com.assetflow.service.impl;

import com.assetflow.assets.model.Asset;
import com.assetflow.assets.service.AssetService;
import com.assetflow.dto.BookingRequest;
import com.assetflow.dto.BookingResponse;
import com.assetflow.dto.EmployeeDTO;
import com.assetflow.entity.Booking;
import com.assetflow.entity.BookingStatus;
import com.assetflow.repository.BookingRepository;
import com.assetflow.service.BookingService;
import com.assetflow.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final AssetService assetService;
    private final EmployeeService employeeService;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        validateBookingRequest(request);

        // Verify Employee existence
        try {
            employeeService.getEmployeeById(request.getEmployeeId());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with ID: " + request.getEmployeeId());
        }

        // Verify Asset existence and eligibility
        Asset asset = assetService.getAssetById(request.getAssetId());
        if (!asset.isSharedBookable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset with ID: " + request.getAssetId() + " is not bookable.");
        }

        // Overlap validation
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getAssetId(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED),
                request.getStartTime(),
                request.getEndTime(),
                null
        );

        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The asset is already booked during this time period.");
        }

        Booking booking = Booking.builder()
                .asset(asset)
                .employeeId(request.getEmployeeId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with ID: " + id));
        return mapToResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByEmployee(Long employeeId) {
        return bookingRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByAsset(Long assetId) {
        return bookingRepository.findByAssetId(assetId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with ID: " + id));

        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with ID: " + id));

        validateBookingRequest(request);

        // Verify Employee existence
        try {
            employeeService.getEmployeeById(request.getEmployeeId());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with ID: " + request.getEmployeeId());
        }

        // Verify Asset existence and eligibility
        Asset asset = assetService.getAssetById(request.getAssetId());
        if (!asset.isSharedBookable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset with ID: " + request.getAssetId() + " is not bookable.");
        }

        // Overlap validation (excluding this booking)
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getAssetId(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED),
                request.getStartTime(),
                request.getEndTime(),
                id
        );

        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The asset is already booked during this time period.");
        }

        booking.setAsset(asset);
        booking.setEmployeeId(request.getEmployeeId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with ID: " + id);
        }
        bookingRepository.deleteById(id);
    }

    private void validateBookingRequest(BookingRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking start time and end time are required.");
        }
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking start time must be in the future.");
        }
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking start time must be before end time.");
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        String employeeName = "Unknown Employee";
        try {
            EmployeeDTO employee = employeeService.getEmployeeById(booking.getEmployeeId());
            if (employee != null) {
                employeeName = employee.getName();
            }
        } catch (Exception e) {
            // Decoupled log or handling: Employee Service may throw exception if employee not found
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .assetId(booking.getAsset().getId())
                .assetName(booking.getAsset().getName())
                .assetTag(booking.getAsset().getAssetTag())
                .employeeId(booking.getEmployeeId())
                .employeeName(employeeName)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .status(booking.getStatus())
                .build();
    }
}

package com.assetflow.controller;

import com.assetflow.dto.BookingRequestDto;
import com.assetflow.entity.Booking;
import com.assetflow.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequestDto request) {
        Booking booking = bookingService.createBooking(request);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Booking>> getEmployeeBookings(@PathVariable Long employeeId) {
        return ResponseEntity.ok(bookingService.getBookingsByEmployee(employeeId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id, @RequestParam Long employeeId) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, employeeId));
    }
}

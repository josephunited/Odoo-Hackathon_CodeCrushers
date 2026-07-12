package com.assetflow.service;

import com.assetflow.dto.BookingRequest;
import com.assetflow.dto.BookingResponse;
import com.assetflow.entity.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    BookingResponse getBookingById(Long id);
    List<BookingResponse> getAllBookings();
    List<BookingResponse> getBookingsByEmployee(Long employeeId);
    List<BookingResponse> getBookingsByAsset(Long assetId);
    BookingResponse updateBookingStatus(Long id, BookingStatus status);
    BookingResponse updateBooking(Long id, BookingRequest request);
    void deleteBooking(Long id);
}

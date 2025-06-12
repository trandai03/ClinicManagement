package com.n7.service;

import com.n7.constant.Status;
import com.n7.dto.AvailableSlotsDTO;
import com.n7.dto.BookingDTO;
import com.n7.entity.Booking;
import com.n7.model.BookingModel;

import java.util.List;
import java.util.Optional;

public interface IBookingService {
    List<BookingModel> findByParam(Status status, Long id, String email,String start, String end);
    Optional<Booking> findById(Long id);
    void updateBooking(Booking booking,Status status);
    String creatBooking(BookingDTO bookingDTO);
    Booking convertDtoToEntity(BookingDTO bookingDTO, Status status);
    void deleteBooking(Long id);
    BookingModel convertEntityToModel(Booking booking);
    void deleteScheduleOfDoctor(Booking booking);
}

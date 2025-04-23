package com.n7.controller;

import com.n7.entity.Booking;
import com.n7.exception.ResourceNotFoundException;
import com.n7.repository.HourRepo;
import com.n7.service.impl.BookingService;
import com.n7.utils.ConvertTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;
@RequiredArgsConstructor
@Controller
public class WebController {
    private final BookingService bookingService;
    private final HourRepo hourRepo;
    @GetMapping("/booking/confirmation-success")
    public String showConfirmationSuccess(@RequestParam("id") Long id, Model model) {
        Optional<Booking> booking = bookingService.findById(id);
        if (booking.isEmpty()) {
            throw new ResourceNotFoundException("Booking not found with id: " + id);
        }
        Booking bookingDetails = booking.get();
        String formattedDate = ConvertTimeUtils.convertDate(bookingDetails.getDate());
        model.addAttribute("date", formattedDate);
        model.addAttribute("name", bookingDetails.getFullName());
        model.addAttribute("time", hourRepo.findById(bookingDetails.getIdHour()).get().getName());
        model.addAttribute("doctorName", bookingDetails.getUser().getFullname());
        model.addAttribute("major", bookingDetails.getUser().getMajor().getName());

        return "confirmation-success";
    }
}

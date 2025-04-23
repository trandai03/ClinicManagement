package com.n7.job;

import com.n7.entity.Booking;
import com.n7.repository.BookingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;

@Configuration
@EnableScheduling
public class DeleteSchedule {
    @Autowired
    private BookingRepo bookingRepo;

    @Scheduled(cron = "0 */1 * * * ?")
    public void deleteSchedules() {
        List<Booking> bookings = bookingRepo.findAll();

    }
}

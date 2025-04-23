package com.n7.job;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class RemindCalendar {

    @Scheduled(cron = "0 0 1 * * *")
    public void remindCalendar() {
        System.out.println("Remind Calendar");
    }
}

package com.n7.job;

import com.n7.constant.Status;
import com.n7.entity.Booking;
import com.n7.entity.Hour;
import com.n7.exception.ResourceNotFoundException;
import com.n7.repository.BookingRepo;
import com.n7.repository.HourRepo;
import com.n7.service.impl.MailService;
import com.n7.utils.ConvertTimeUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class RemindCalendar {

    private final BookingRepo bookingRepo;
    private final HourRepo hourRepo;
    private final MailService mailService;

    @Scheduled(cron = "0 0 8 * * *")  // Chạy lúc 8:00 sáng mỗi ngày
    public void remindCalendar() {
        try {
            Date currentDate = DateUtils.truncate(new Date(), Calendar.DATE);
            
            // Lấy danh sách booking có ngày khám trong 1-3 ngày tới
            List<Booking> upcomingBookings = bookingRepo.findUpcomingBookings(
                Status.ACCEPTING, 
                DateUtils.addDays(currentDate, 1),  // ngày mai
                DateUtils.addDays(currentDate, 3)   // 3 ngày sau
            );

            for (Booking booking : upcomingBookings) {
                Hour hour = hourRepo.findById(booking.getIdHour())
                                  .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giờ khám"));

                // Tính số ngày còn lại đến lịch khám
                int daysUntilAppointment = (int) ((DateUtils.truncate(booking.getDate(), Calendar.DATE).getTime() 
                                                  - currentDate.getTime()) / (1000 * 60 * 60 * 24));

                String emailContent = String.format("""
                    <h2>Nhắc lịch khám - Còn %d ngày</h2>
                    <p>Xin chào %s,</p>
                    <p>Phòng khám xin nhắc bạn có lịch khám vào ngày %s (còn %d ngày nữa):</p>
                    <ul>
                        <li>Thời gian khám: %s</li>
                        <li>Bác sĩ: %s</li>
                        <li>Chuyên khoa: %s</li>
                        <li>Địa chỉ: [Địa chỉ phòng khám]</li>
                    </ul>
                    <p>Lưu ý:</p>
                    <ul>
                        <li>Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục</li>
                        <li>Mang theo giấy tờ tùy thân</li>
                        <li>Mang theo các kết quả xét nghiệm trước đó (nếu có)</li>
                        <li>Nhớ ăn sáng/trưa trước khi đến khám (nếu không có yêu cầu nhịn ăn)</li>
                    </ul>
                    %s
                    <p>Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ số điện thoại: [Số điện thoại] trong giờ hành chính.</p>
                    <p>Trân trọng,<br>[Tên phòng khám]</p>
                    """,
                    daysUntilAppointment,
                    booking.getFullName(),
                    ConvertTimeUtils.dateToString(booking.getDate()),
                    daysUntilAppointment,
                    hour.getName(),
                    booking.getUser().getFullname(),
                    booking.getUser().getMajor().getName(),
                    daysUntilAppointment == 1 ? "<p><strong>Ngày mai là ngày khám của bạn, nhớ chuẩn bị đầy đủ nhé!</strong></p>" : ""
                );

                try {
                    mailService.sendMail(
                        booking.getEmail(),
                        String.format("Nhắc lịch khám - Còn %d ngày", daysUntilAppointment),
                        emailContent
                    );
                    log.info("Đã gửi email nhắc lịch khám cho booking ID: {} - Ngày khám: {} - Còn {} ngày", 
                            booking.getId(), 
                            ConvertTimeUtils.dateToString(booking.getDate()),
                            daysUntilAppointment);
                } catch (MessagingException ex) {
                    log.error("Lỗi khi gửi email nhắc lịch khám cho booking ID: {} - Ngày khám: {} - Còn {} ngày", 
                            booking.getId(), 
                            ConvertTimeUtils.dateToString(booking.getDate()),
                            daysUntilAppointment,
                            ex);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi trong quá trình nhắc lịch khám", e);
        }
    }
}

package com.n7.model;

import com.n7.constant.Gender;
import com.n7.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingModel {
    private Long id;
    private String name;
    private Gender gender;
    private String dob;
    private String email;
    private String phone;
    private String date;
    private Long idHour;
    private String status;
    private String note;
    private String nameDoctor;
    private String major;

    public static BookingModel fromEntity(Booking booking) {
        return BookingModel.builder()
                .id(booking.getId())
                .name(booking.getFullName())
                .gender(booking.getGender())
                .dob(booking.getDob())
                .email(booking.getEmail())
                .phone(booking.getPhone())
                .date(booking.getDate().toString())
                .idHour(booking.getIdHour())
                .status(booking.getStatus().name())
                .note(booking.getNote())
                .name(booking.getFullName())
                .nameDoctor(booking.getUser().getFullname())
                .major(booking.getUser().getMajor().getName())
                .build();
    }

    public static List<BookingModel> fromEntityList(List<Booking> bookings) {
        return bookings.stream().map(BookingModel::fromEntity).collect(Collectors.toList());
    }
}

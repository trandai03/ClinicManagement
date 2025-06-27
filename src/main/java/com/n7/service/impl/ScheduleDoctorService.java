package com.n7.service.impl;

import com.n7.dto.*;
import com.n7.entity.DoctorScheduleHour;
import com.n7.entity.Hour;
import com.n7.entity.User;
import com.n7.repository.BookingRepo;
import com.n7.repository.DoctorScheduleHourRepository;
import com.n7.repository.DoctorScheduleRepository;
import com.n7.repository.HourRepo;
import com.n7.repository.UserRepo;
import com.n7.service.IDoctorScheduleService;
import com.n7.utils.ConvertTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleDoctorService implements IDoctorScheduleService {
        private final DoctorScheduleRepository doctorScheduleRepository;
        private final DoctorScheduleHourRepository doctorScheduleHourRepository;
        private final UserRepo userRepo;
        private final HourRepo hourRepo;

        @Override
        @Transactional
        public void createDoctorSchedule(DoctorScheduleCreateRequest request) {
                // Tìm doctor
                User doctor = userRepo.findById(request.getIdUser())
                                .orElseThrow(() -> new RuntimeException("Doctor not found"));

                // Convert date
                LocalDate scheduleDate = ConvertTimeUtils.stringToLocalDate(request.getDate());

                // Lưu từng hour schedule
                for (Long hourId : request.getHours()) {
                        Hour hour = hourRepo.findById(hourId)
                                        .orElseThrow(() -> new RuntimeException("Hour not found"));

                        // Kiểm tra xem đã có schedule này chưa
                        List<DoctorScheduleHour> existing = doctorScheduleHourRepository
                                        .findByDoctorIdAndSpecificDate(doctor.getId(), scheduleDate);

                        boolean alreadyExists = existing.stream()
                                        .anyMatch(dsh -> dsh.getHour().getId().equals(hourId));

                        if (!alreadyExists) {
                                DoctorScheduleHour scheduleHour = new DoctorScheduleHour();
                                scheduleHour.setDoctor(doctor);
                                scheduleHour.setHour(hour);
                                scheduleHour.setSpecificDate(scheduleDate);
                                scheduleHour.setStatus("AVAILABLE");
                                scheduleHour.setNote(request.getNote());

                                doctorScheduleHourRepository.save(scheduleHour);
                        }
                }
        }

        @Override
        public List<DoctorScheduleHourDTO> getDoctorSchedulesByDateRange(Long doctorId, String fromDate,
                        String toDate) {
                LocalDate from = ConvertTimeUtils.stringToLocalDate(fromDate);
                LocalDate to = ConvertTimeUtils.stringToLocalDate(toDate);

                List<DoctorScheduleHour> schedules = doctorScheduleHourRepository
                                .findByDoctorIdAndDateRange(doctorId, from, to);

                return schedules.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void deleteDoctorSchedule(Long scheduleId) {
                doctorScheduleHourRepository.deleteById(scheduleId);
        }

        @Override
        @Transactional
        public void createUnavailablePeriod(UnavailablePeriodRequest request) {
                User doctor = userRepo.findById(request.getIdDoctor())
                                .orElseThrow(() -> new RuntimeException("Doctor not found"));

                LocalDate fromDate = ConvertTimeUtils.stringToLocalDate(request.getFromDate());
                LocalDate toDate = ConvertTimeUtils.stringToLocalDate(request.getToDate());

                // Lấy tất cả hours
                List<Hour> allHours = hourRepo.findAll();

                // Tạo unavailable cho mỗi ngày trong khoảng thời gian
                LocalDate currentDate = fromDate;
                while (!currentDate.isAfter(toDate)) {
                        for (Hour hour : allHours) {
                                // Kiểm tra xem đã có schedule này chưa
                                List<DoctorScheduleHour> existing = doctorScheduleHourRepository
                                                .findByDoctorIdAndSpecificDate(doctor.getId(), currentDate);

                                boolean alreadyExists = existing.stream()
                                                .anyMatch(dsh -> dsh.getHour().getId().equals(hour.getId()));

                                if (!alreadyExists) {
                                        DoctorScheduleHour scheduleHour = new DoctorScheduleHour();
                                        scheduleHour.setDoctor(doctor);
                                        scheduleHour.setHour(hour);
                                        scheduleHour.setSpecificDate(currentDate);
                                        scheduleHour.setStatus("UNAVAILABLE");
                                        scheduleHour.setNote(
                                                        request.getReason() + (request.getNote() != null
                                                                        ? " - " + request.getNote()
                                                                        : ""));

                                        doctorScheduleHourRepository.save(scheduleHour);
                                } else {
                                        // Update existing to UNAVAILABLE
                                        existing.stream()
                                                        .filter(dsh -> dsh.getHour().getId().equals(hour.getId()))
                                                        .forEach(dsh -> {
                                                                dsh.setStatus("UNAVAILABLE");
                                                                dsh.setNote(request.getReason()
                                                                                + (request.getNote() != null ? " - "
                                                                                                + request.getNote()
                                                                                                : ""));
                                                                doctorScheduleHourRepository.save(dsh);
                                                        });
                                }
                        }
                        currentDate = currentDate.plusDays(1);
                }
        }

        @Override
        public List<DoctorScheduleHourDTO> getAvailableSlotsByDate(String date) {
                LocalDate scheduleDate = ConvertTimeUtils.stringToLocalDate(date);
                List<DoctorScheduleHour> availableSlots = doctorScheduleHourRepository
                                .findAvailableByDate(scheduleDate);

                return availableSlots.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Override
        public List<DoctorScheduleHourDTO> getAvailableSlotsByDoctorAndDate(Long doctorId, String date) {
                LocalDate scheduleDate = ConvertTimeUtils.stringToLocalDate(date);
                List<DoctorScheduleHour> availableSlots = doctorScheduleHourRepository
                                .findAvailableByDoctorAndDate(doctorId, scheduleDate);

                return availableSlots.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        // ========== NEW METHODS IMPLEMENTATION ==========

        @Override
        @Transactional
        public void updateDoctorSchedule(Long scheduleId, DoctorScheduleUpdateRequest request) {
                DoctorScheduleHour scheduleHour = doctorScheduleHourRepository.findById(scheduleId)
                                .orElseThrow(() -> new RuntimeException("Schedule not found"));

                scheduleHour.setStatus(request.getStatus());
                if (request.getNote() != null) {
                        scheduleHour.setNote(request.getNote());
                }

                doctorScheduleHourRepository.save(scheduleHour);
        }

        @Override
        @Transactional
        public void deleteDoctorScheduleByDate(Long doctorId, String date) {
                LocalDate scheduleDate = ConvertTimeUtils.stringToLocalDate(date);
                List<DoctorScheduleHour> schedules = doctorScheduleHourRepository
                                .findByDoctorIdAndSpecificDate(doctorId, scheduleDate);

                doctorScheduleHourRepository.deleteAll(schedules);
        }

        @Override
        public List<AvailableSlotsDTO> getAvailableSlotsByMajorAndDate(Long majorId, String date) {
                LocalDate scheduleDate = ConvertTimeUtils.stringToLocalDate(date);

                // Lấy tất cả bác sĩ thuộc chuyên khoa
                List<User> doctors = userRepo.findDoctorByMajor(majorId);

                List<AvailableSlotsDTO> availableSlots = new ArrayList<>();

                for (User doctor : doctors) {
                        List<DoctorScheduleHour> doctorSlots = doctorScheduleHourRepository
                                        .findAvailableByDoctorAndDate(doctor.getId(), scheduleDate);

                        for (DoctorScheduleHour slot : doctorSlots) {
                                AvailableSlotsDTO dto = new AvailableSlotsDTO();
                                dto.setHourId(slot.getHour().getId());
                                dto.setHourName(slot.getHour().getName());
                                dto.setDoctorId(doctor.getId());
                                dto.setDoctorName(doctor.getFullname());
                                dto.setSession(slot.getHour().getSession());
                                // Add doctor rank information
                                if (doctor.getDoctorRank() != null) {
                                        dto.setDoctorRankId(doctor.getDoctorRank().getId());
                                        dto.setDoctorRankName(doctor.getDoctorRank().getName());
                                        dto.setDoctorRankCode(doctor.getDoctorRank().getCode());
                                        dto.setDoctorRankBasePrice(doctor.getDoctorRank().getBasePrice());
                                        dto.setDoctorRankDescription(doctor.getDoctorRank().getDescription());
                                }

                                availableSlots.add(dto);
                        }
                }

                return availableSlots;
        }

        @Override
        public boolean isSlotAvailable(Long doctorId, Long hourId, String date) {
                LocalDate scheduleDate = ConvertTimeUtils.stringToLocalDate(date);

                List<DoctorScheduleHour> schedules = doctorScheduleHourRepository
                                .findByDoctorIdAndSpecificDate(doctorId, scheduleDate);

                return schedules.stream()
                                .anyMatch(schedule -> schedule.getHour().getId().equals(hourId) &&
                                                "AVAILABLE".equals(schedule.getStatus()));
        }

        @Override
        public DoctorScheduleStatistics getDoctorScheduleStatistics(Long doctorId, String fromDate, String toDate) {
                LocalDate from = ConvertTimeUtils.stringToLocalDate(fromDate);
                LocalDate to = ConvertTimeUtils.stringToLocalDate(toDate);

                List<DoctorScheduleHour> schedules = doctorScheduleHourRepository
                                .findByDoctorIdAndDateRange(doctorId, from, to);

                User doctor = userRepo.findById(doctorId)
                                .orElseThrow(() -> new RuntimeException("Doctor not found"));

                // Tính toán statistics
                DoctorScheduleStatistics stats = new DoctorScheduleStatistics();
                stats.setDoctorId(doctorId);
                stats.setDoctorName(doctor.getFullname());
                stats.setFromDate(fromDate);
                stats.setToDate(toDate);

                // Basic counts
                stats.setTotalWorkingHours(schedules.size());
                stats.setTotalAvailableSlots((int) schedules.stream()
                                .filter(s -> "AVAILABLE".equals(s.getStatus())).count());
                stats.setTotalUnavailableSlots((int) schedules.stream()
                                .filter(s -> "UNAVAILABLE".equals(s.getStatus())).count());

                // Working days
                Set<LocalDate> workingDates = schedules.stream()
                                .map(DoctorScheduleHour::getSpecificDate)
                                .collect(Collectors.toSet());
                stats.setTotalWorkingDays(workingDates.size());

                // Rates calculation
                if (stats.getTotalWorkingHours() > 0) {
                        stats.setAvailabilityRate((double) stats.getTotalAvailableSlots() /
                                        stats.getTotalWorkingHours() * 100);
                }

                // Daily working hours map
                Map<String, Integer> dailyHours = schedules.stream()
                                .collect(Collectors.groupingBy(
                                                s -> ConvertTimeUtils.localDateToString(s.getSpecificDate()),
                                                Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)));
                stats.setDailyWorkingHours(dailyHours);

                // Hourly statistics
                Map<String, Integer> hourlyStats = schedules.stream()
                                .collect(Collectors.groupingBy(
                                                s -> s.getHour().getName(),
                                                Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)));
                stats.setHourlyBookings(hourlyStats);

                return stats;
        }

        @Override
        public List<String> getAvailableDatesByDoctor(Long doctorId) {
                LocalDate now =  LocalDate.now();
                List<DoctorScheduleHour> schedules = doctorScheduleHourRepository
                                .findByDoctorId(doctorId,now);
                return schedules.stream()
                                .map(s -> ConvertTimeUtils.localDateToString(s.getSpecificDate()))
                                .collect(Collectors.toList());
        }

        public List<LocalDate> getAvailableSlotsByMajor(Long majorId) {
                LocalDate now = LocalDate.now();
                List<LocalDate> list = doctorScheduleHourRepository.findAvailableByMajor(majorId, now);
                return list;
        }

        private DoctorScheduleHourDTO convertToDTO(DoctorScheduleHour scheduleHour) {
                DoctorScheduleHourDTO dto = new DoctorScheduleHourDTO();
                dto.setId(scheduleHour.getId());
                dto.setIdUser(scheduleHour.getDoctor().getId());
                dto.setIdHour(scheduleHour.getHour().getId());
                dto.setDate(ConvertTimeUtils.localDateToString(scheduleHour.getSpecificDate()));
                dto.setStatus(scheduleHour.getStatus());
                dto.setNote(scheduleHour.getNote());
                dto.setHourName(scheduleHour.getHour().getName());

                // Add doctor information
                dto.setDoctorName(scheduleHour.getDoctor().getFullname());
                if (scheduleHour.getDoctor().getMajor() != null) {
                        dto.setDoctorMajor(scheduleHour.getDoctor().getMajor().getName());
                }

                return dto;
        }
}

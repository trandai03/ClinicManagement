package com.n7.repository;

import com.n7.entity.DoctorScheduleHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Repository
public interface DoctorScheduleHourRepository extends JpaRepository<DoctorScheduleHour, Long> {

    // Tìm lịch theo doctor và khoảng thời gian
    @Query("SELECT dsh FROM DoctorScheduleHour dsh WHERE dsh.doctor.id = :doctorId " +
            "AND dsh.specificDate BETWEEN :fromDate AND :toDate order by dsh.dayOfWeek ")
    List<DoctorScheduleHour> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    // Tìm lịch theo ngày cụ thể
    List<DoctorScheduleHour> findBySpecificDate(LocalDate specificDate);

    // Tìm lịch theo doctor và ngày cụ thể
    List<DoctorScheduleHour> findByDoctorIdAndSpecificDate(Long doctorId, LocalDate specificDate);

    // Tìm lịch có sẵn theo ngày
    @Query("SELECT dsh FROM DoctorScheduleHour dsh WHERE dsh.specificDate = :date " +
            "AND dsh.status = 'AVAILABLE'")
    List<DoctorScheduleHour> findAvailableByDate(@Param("date") LocalDate date);

    // Tìm lịch có sẵn của bác sĩ theo ngày
    @Query("SELECT dsh FROM DoctorScheduleHour dsh WHERE dsh.doctor.id = :doctorId " +
            "AND dsh.specificDate = :date AND dsh.status = 'AVAILABLE'")
    List<DoctorScheduleHour> findAvailableByDoctorAndDate(@Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    // Tìm lịch có sẵn của bác sĩ theo ngày
    @Query("SELECT DISTINCT dsh FROM DoctorScheduleHour dsh WHERE dsh.doctor.id = :doctorId " +
            "AND dsh.status = 'AVAILABLE' AND dsh.specificDate > :date")
    List<DoctorScheduleHour> findByDoctorId(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT DISTINCT dsh.specificDate FROM DoctorScheduleHour dsh WHERE dsh.doctor.major.id = :majorId " +
            "AND dsh.status = 'AVAILABLE' and dsh.specificDate >= :date")
    List<LocalDate> findAvailableByMajor(@Param("majorId") Long majorId, @Param("date") LocalDate date);
}
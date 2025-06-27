package com.n7.service.impl;

import com.n7.constant.Status;
import com.n7.dto.AvailableSlotsDTO;
import com.n7.dto.BookingDTO;
import com.n7.entity.*;
import com.n7.exception.ResourceAlreadyExitsException;
import com.n7.exception.ResourceNotFoundException;
import com.n7.model.BookingModel;
import com.n7.model.ScheduleModel;
import com.n7.model.ServiceRequestModel;
import com.n7.repository.*;
import com.n7.service.IBookingService;
import com.n7.utils.ConvertTimeUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService implements IBookingService {
    private final BookingRepo bookingRepo;
    private final UserRepo userRepo;
    private final ScheduleRepo scheduleRepo;
    private final ScheduleUserRepo scheduleUserRepo;
    private final ScheduleService scheduleService;
    private final HourRepo hourRepo;
    private final MailService mailService;
    private final ServiceRequestRepository serviceRequestRepository;
    private final HistoryRepo historyRepo;

    public Optional<Booking> findById(Long id) {
        return bookingRepo.findById(id);
    }

    public List<BookingModel> findByParam(Status status, Long id, String email, String start, String end) {
        Date en = null, st = null;
        if(start!=null) st = ConvertTimeUtils.stringToDate(start);
        if(end!=null) en = ConvertTimeUtils.stringToDate(end);
        if(start == null && !status.equals(Status.SUCCESS)){
            LocalDateTime newDate = LocalDateTime.now().minusDays(1);
            st = Date.from(newDate.atZone(ZoneId.systemDefault()).toInstant());
        }
//        List<Booking> bookingList = bookingRepo.findByCustom(id,status,email,st,en);
        return bookingRepo.findByCustom(id,status,email,st,en).stream().map(this::convertEntityToModel).collect(Collectors.toList());
//        return BookingModel.fromEntityList(bookingList);
    }

    public Integer countBookingByStatus(Status status,Long doctorId) {
        Date start = null;
        if(!status.equals(Status.SUCCESS)){
            start = new Date();
        }
        return bookingRepo.countBookingByStatus(status,doctorId,start);
    }
    public Map<Status, Integer> getBookingCounts(Long doctorId) {
        Date now = new Date();
    
        // SUCCESS không filter theo ngày, các status khác cần filter
        List<Object[]> statusWithDate = bookingRepo.countBookingsGroupedByStatus(doctorId, now,null);
        List<Object[]> successOnly = bookingRepo.countBookingsGroupedByStatus(doctorId, null,Status.SUCCESS);
        log.info("withDate "+statusWithDate.toString());
        log.info("success "+successOnly.toString());
        Map<Status, Integer> counts = new EnumMap<>(Status.class);
    
        // Gộp 2 kết quả lại
        for (Object[] row : statusWithDate) {
            Status status = (Status) row[0];
            counts.put(status, ((Long) row[1]).intValue());
        }
    
        for (Object[] row : successOnly) {
            Status status = (Status) row[0];
            // Nếu đã tồn tại (vd: SUCCESS đã có) thì bỏ qua
            counts.put(status, ((Long) row[1]).intValue());
        }
    log.info("counts "+counts.toString());
        return counts;
    }

    public Map<Integer, Integer> getBookingCountsByDoctor() {
        Calendar cal = Calendar.getInstance(); // lấy thời gian hiện tại
        cal.set(Calendar.DAY_OF_MONTH, 1); // set về ngày đầu tiên
        Date firstDay = cal.getTime();

        // Lấy ngày cuối cùng của tháng
        cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH));
        Date lastDay = cal.getTime();
        List<Object[]> bookingCounts = bookingRepo.countBookingsGroupedByDoctor(firstDay,Status.SUCCESS,lastDay);
        Map<Integer, Integer> counts = new HashMap<>();
        for(Object[] row : bookingCounts){
            Integer doctorId = ((Number) row[0]).intValue();
            Integer count = ((Number) row[1]).intValue();
            counts.put(doctorId, count);
        }
        log.info("counts "+counts.toString());
        return counts;
    }
    

    @Transactional
    public String creatBooking(BookingDTO bookingDTO) {
        Optional<User> user = userRepo.findById(bookingDTO.getIdUser());
        if(user.isEmpty()) {
            throw new ResourceNotFoundException("Khong tim thay id Doctor");
        }
        user.get().getListSchedule().stream().forEach( e -> {
            if(e.getSchedule().equals(bookingDTO.getDate()) && e.getSchedule().getHour().getId() == bookingDTO.getIdHour()) {
                throw new ResourceAlreadyExitsException("Lịch đặt đã bị trùng!!!");
            }
        });
        // Save Booking
        Booking booking = convertDtoToEntity(bookingDTO,Status.PENDING);
        booking.setUser(user.get());
        bookingRepo.save(booking);
        // Save Schedule of Doctor
        Optional<Hour> hour = hourRepo.findById(booking.getIdHour());
        if(hour.isEmpty()) {
            throw new ResourceNotFoundException("Lich dat với id không hợp lệ");
        }
        Schedule schedule = new Schedule(ConvertTimeUtils.stringToDate(bookingDTO.getDate()),hour.get());
        scheduleRepo.save(schedule);
        ScheduleUser scheduleUser = new ScheduleUser();
        scheduleUser.setUser(user.get());
        scheduleUser.setSchedule(schedule);
        scheduleUserRepo.save(scheduleUser);
        String s = "<h1>Thư xác nhận lịch khám</h1>\n" +
                "    <p>Tên người khám: "+bookingDTO.getName()+"</p>\n" +
                "    <p>Ngày sinh: "+bookingDTO.getDob()+"</p>\n" +
                "    <p>Giới tính: "+bookingDTO.getGender()+"</p>\n" +
                "    <p>Ngày khám: "+bookingDTO.getDate()+"</p>\n" +
                "    <p>Thòi gian khám: "+hour.get().getName()+"</p>\n" +
                "    <p>Tên bác sĩ khám: "+user.get().getFullname()+"</p>\n" +
                "    <p>Chuyên ngành: "+user.get().getMajor().getName()+"</p>\n" +
                "    <h4>Hãy nhấn xác nhận để lịch khám được hoàn thành đăng ký.</h4>\n" +
                "    <a href='http://localhost:8080/api/v1/confirm/"+booking.getId()+"?token="+booking.getToken()+"'><h2>Xác nhận</h2></a>";
        return s;
    }
    @Transactional
    public boolean creatBookingWithUser(BookingDTO bookingDTO) {
        Optional<User> user = userRepo.findById(bookingDTO.getIdUser());
        if(user.isEmpty()) {
            throw new ResourceNotFoundException("Khong tim thay id Doctor");
        }
        user.get().getListSchedule().stream().forEach( e -> {
            if(e.getSchedule().equals(bookingDTO.getDate()) && e.getSchedule().getHour().getId() == bookingDTO.getIdHour()) {
                throw new ResourceAlreadyExitsException("Lịch đặt đã bị trùng!!!");
            }
        });
        // Save Booking
        Booking booking = convertDtoToEntity(bookingDTO,Status.CONFIRMING);
        booking.setUser(user.get());

        bookingRepo.save(booking);
        // Save Schedule of Doctor
        Optional<Hour> hour = hourRepo.findById(booking.getIdHour());
        if(hour.isEmpty()) {
            throw new ResourceNotFoundException("Lich dat với id không hợp lệ");
        }
        Schedule schedule = new Schedule(ConvertTimeUtils.stringToDate(bookingDTO.getDate()),hour.get());
        scheduleRepo.save(schedule);
        ScheduleUser scheduleUser = new ScheduleUser();
        scheduleUser.setUser(user.get());
        scheduleUser.setSchedule(schedule);
        scheduleUserRepo.save(scheduleUser);
        return true;
    }

    @Transactional
    public void updateBooking(Booking booking, Status status) {
        // Validate input
        if (booking == null || status == null) {
            throw new IllegalArgumentException("Booking và status không được null");
        }

        // Kiểm tra trạng thái hiện tại của booking có hợp lệ không
        if (booking.getStatus() == Status.SUCCESS || booking.getStatus() == Status.FAILURE) {
            throw new IllegalStateException("Không thể cập nhật trạng thái cho booking đã hoàn thành hoặc đã hủy");
        }

        // Validate workflow transitions
        validateStatusTransition(booking.getStatus(), status);

        // Logic cập nhật status
        if(status.equals(Status.ACCEPTING)) {
            handleAcceptingStatus(booking);
        } else if(status.equals(Status.IN_PROGRESS)) {
            handleInProgressStatus(booking);
        } else if(status.equals(Status.AWAITING_RESULTS)) {
            handleAwaitingResultsStatus(booking);
        } else if(status.equals(Status.SUCCESS)) {
            handleSuccessStatus(booking);
        } else {
            booking.setStatus(status);
            if(status.equals(Status.FAILURE)) {
                deleteScheduleOfDoctor(booking);
            }
        }
        
        bookingRepo.save(booking);
    }

    /**
     * Validate status transition according to workflow
     */
    private void validateStatusTransition(Status currentStatus, Status newStatus) {
        Map<Status, Set<Status>> allowedTransitions = Map.of(
            Status.PENDING, Set.of(Status.CONFIRMING, Status.FAILURE),
            Status.CONFIRMING, Set.of(Status.ACCEPTING, Status.FAILURE),
            Status.ACCEPTING, Set.of(Status.IN_PROGRESS, Status.FAILURE),
            Status.IN_PROGRESS, Set.of(Status.AWAITING_RESULTS, Status.SUCCESS, Status.FAILURE),
            Status.AWAITING_RESULTS, Set.of(Status.SUCCESS, Status.FAILURE)
        );

        Set<Status> allowed = allowedTransitions.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new IllegalStateException(
                String.format("Không thể chuyển từ trạng thái %s sang %s", 
                    currentStatus, newStatus)
            );
        }
    }

    private void handleAcceptingStatus(Booking booking) {
        List<Booking> existingBookings = bookingRepo.checkLich(
            booking.getIdHour(),
            booking.getUser().getId(),
            Status.ACCEPTING,
            booking.getDate()
        );
        
        if(existingBookings.size()>6) {
            throw new ResourceAlreadyExitsException(
                String.format("Bác sĩ %s đã có lịch khám vào ngày %s giờ %s", 
                    booking.getUser().getFullname(),
                    ConvertTimeUtils.dateToString(booking.getDate()),
                    booking.getIdHour())
            );
        }

        booking.setStatus(Status.ACCEPTING);
        booking.setToken(null);
        bookingRepo.save(booking);
        
        // Handle conflicting bookings
//        List<Booking> conflictingBookings = bookingRepo.checkLich(
//            booking.getIdHour(),
//            booking.getUser().getId(),
//            Status.CONFIRMING,
//            booking.getDate()
//        );
//
//        if(!conflictingBookings.isEmpty()) {
//            for(Booking conflictingBooking : conflictingBookings) {
//                if(!conflictingBooking.getId().equals(booking.getId())) {
//                    conflictingBooking.setStatus(Status.FAILURE);
//                    bookingRepo.save(conflictingBooking);
//                    deleteScheduleOfDoctor(conflictingBooking);
//                    try {
//                        mailService.sendMail(
//                            conflictingBooking.getEmail(),
//                            "Thư hủy lịch khám",
//                            "<h2>Bác sĩ bạn đặt đã có việc bận đột xuất. " +
//                            "Rất xin lỗi và mong được gặp lại bạn vào thời gian khác.</h2>"
//                        );
//                    } catch (MessagingException ex) {
//                        throw new RuntimeException(ex);
//                    }
//                }
//            }
//        }
    }

    private void handleInProgressStatus(Booking booking) {
        booking.setStatus(Status.IN_PROGRESS);
        booking.setStartTime(LocalDateTime.now());
    }

    private void handleAwaitingResultsStatus(Booking booking) {
        booking.setStatus(Status.AWAITING_RESULTS);
        // Không thay đổi start/end time, chỉ đổi status
    }

    private void handleSuccessStatus(Booking booking) {
        booking.setStatus(Status.SUCCESS);
        booking.setEndTime(LocalDateTime.now());
        booking.setPaymentStatus("PAID");
        booking.setPaidAt(LocalDateTime.now());
        deleteScheduleOfDoctor(booking);
    }


    public void deleteBooking(Long id) {
        Optional<Booking> booking = bookingRepo.findById(id);
        booking.get().setStatus(Status.FAILURE);
        deleteScheduleOfDoctor(booking.get());
        bookingRepo.save(booking.get());
    }

    public Booking convertDtoToEntity(BookingDTO bookingDTO, Status status) {
        return new Booking(bookingDTO.getName(),bookingDTO.getDob(),bookingDTO.getPhone(),bookingDTO.getEmail(),bookingDTO.getGender(),
                bookingDTO.getAddress(),ConvertTimeUtils.stringToDate(bookingDTO.getDate()),bookingDTO.getIdHour(),status,bookingDTO.getNote(),
                UUID.randomUUID().toString());
    }

    @Transactional
    public void deleteScheduleOfDoctor(Booking booking) {
        List<ScheduleModel> scheduleModels = scheduleService.getAllBy(booking.getDate(),booking.getIdHour());
        for(ScheduleModel scheduleModel : scheduleModels) {
            Optional<ScheduleUser> scheduleUser = scheduleUserRepo.
                    findByUser_IdAndSchedule_Id(booking.getUser().getId(),scheduleModel.getId());
            scheduleUserRepo.deleteById(scheduleUser.get().getId());
            scheduleRepo.deleteById(scheduleModel.getId());
        }
    }


    public BookingModel convertEntityToModel(Booking booking) {

        BookingModel bookingModel = new BookingModel();
        bookingModel.setId(booking.getId());
        bookingModel.setName(booking.getFullName());
        bookingModel.setGender(booking.getGender());
        bookingModel.setDob(booking.getDob());
        bookingModel.setEmail(booking.getEmail());
        bookingModel.setPhone(booking.getPhone());
        bookingModel.setDate(booking.getDate());
        bookingModel.setIdHour(booking.getIdHour());
        bookingModel.setStatus(booking.getStatus().toString());
        bookingModel.setNote(booking.getNote());
        bookingModel.setInitialSymptoms(booking.getInitialSymptoms());
        bookingModel.setNameDoctor(booking.getUser().getFullname());
        bookingModel.setMajor(booking.getUser().getMajor().getName());
        bookingModel.setServiceRequests(ServiceRequestModel.fromEntityToModals(serviceRequestRepository.findByBooking_Id(booking.getId())));
        Optional<History> history= historyRepo.findByBookingId(booking.getId());
        if(history.isPresent()){
            bookingModel.setHistoryId(history.get().getId());
        }
        return bookingModel;
    }
}

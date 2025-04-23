package com.n7.service.impl;

import com.n7.entity.Schedule;
import com.n7.entity.ScheduleUser;
import com.n7.entity.User;
import com.n7.model.ScheduleModel;
import com.n7.repository.ScheduleRepo;
import com.n7.repository.ScheduleUserRepo;
import com.n7.service.IScheduleService;
import com.n7.utils.ConvertTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService implements IScheduleService {
    private final ScheduleRepo scheduleRepo;
    private final ScheduleUserRepo scheduleUserRepo;

    public List<ScheduleModel> getAllBy(Date date, Long i) {
        Optional<Schedule> op = scheduleRepo.findByHour_IdAndDate(i,date);
        return op.map(e -> List.of(convertToModel(e))).orElse(new ArrayList<>());

    }

    public List<ScheduleModel> getAllSchedule(Long idDoctor) {
        List<ScheduleUser> sch =  scheduleUserRepo.findAllByUserId(idDoctor);
        List<Schedule> list = new ArrayList<>();
        sch.forEach(e -> list.add(e.getSchedule()));
        return list.stream().map(this::convertToModel).collect(Collectors.toList());
    }

    public ScheduleModel convertToModel(Schedule schedule) {
        ScheduleModel scheduleModel = new ScheduleModel();
        scheduleModel.setId(schedule.getId());
        scheduleModel.setDate(ConvertTimeUtils.dateToString(schedule.getDate()));
        scheduleModel.setIdHour(schedule.getHour().getId());
        return scheduleModel;
    }
}

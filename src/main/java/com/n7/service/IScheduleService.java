package com.n7.service;

import com.n7.entity.Schedule;
import com.n7.model.ScheduleModel;

import java.util.Date;
import java.util.List;

public interface IScheduleService {
    ScheduleModel convertToModel(Schedule schedule);
    List<ScheduleModel> getAllSchedule(Long idDoctor);
    List<ScheduleModel> getAllBy(Date date, Long i);
}

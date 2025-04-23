package com.n7.entity;

import com.n7.constant.TimeChoose;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "schedule")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date date;

    @ManyToOne
    private Hour hour;

    @OneToMany(mappedBy = "schedule",cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    private List<ScheduleUser> listUser = new ArrayList<>();

    public Schedule(Date date, Hour hour) {
        this.date = date;
        this.hour = hour;
    }
}

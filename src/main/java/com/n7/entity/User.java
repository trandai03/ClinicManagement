package com.n7.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String fullname;

    @Column(length = 100)
    private String username;

    @Column(length = 100, nullable = false)
    private String password;

    @Column(length = 20)
    private String phone;

    @Column(length = 50)
    private String gmail;

    @Column(length = 100)
    private String avatar;

    @Column(length = 20)
    private String trangthai;

    @Column(length = 100)
    private String urlId;

    @Column(length = 255)
    private String description;

    private boolean enabled;

    @Column(length = 50)
    private String captcha;

    @Column(length = 6)
    private String otp;

    @ManyToOne
    @JoinColumn(name = "doctor_rank_id",referencedColumnName = "id")
    private DoctorRank doctorRank;

    private LocalDateTime otpExpiryTime;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updateAt;

    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    private Role role;

    @ManyToOne
    @JoinColumn(name = "major_id", referencedColumnName = "id")
    private Major major;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleUser> listSchedule = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Booking> listBooking = new ArrayList<>();

    @OneToOne
    private Profile profile;

    public boolean isOTPValid(String inputOTP) {
        return this.otp != null &&
                this.otp.equals(inputOTP) &&
                this.otpExpiryTime != null &&
                LocalDateTime.now().isBefore(this.otpExpiryTime);
    }

    public boolean isOTPExpired() {
        return this.otpExpiryTime == null || LocalDateTime.now().isAfter(this.otpExpiryTime);
    }

    public void clearOTP() {
        this.otp = null;
        this.otpExpiryTime = null;
    }
}

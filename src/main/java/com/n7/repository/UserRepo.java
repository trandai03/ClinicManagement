package com.n7.repository;

import com.n7.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsername(String username);

    User findByGmailAndEnabled(String email, boolean enable);

    User findByPhoneAndEnabled(String phone, boolean enabled);

    User findByGmailAndEnabledAndCaptcha(String email, boolean enable, String captcha);

    @Query("SELECT u FROM User u " +
            "WHERE (:id IS NULL OR u.major.id = :id) " +
            "AND (:enabled IS NULL OR u.enabled = :enabled) " +
            "AND (:fullname IS NULL OR u.fullname LIKE %:fullname%)")
    Page<User> findByCustom(Long id, Boolean enabled, String fullname, Pageable pageable);
    @Query("SELECT u FROM User u " +
            "WHERE (:id IS NULL OR u.major.id = :id) " +
            "AND u.enabled = true " +
            "AND u.role.id = 2" +
            "AND (:name IS NULL OR u.fullname LIKE %:name%)")
    List<User> findDoctor(@Param("id") Long id, @Param("name" ) String name);

    @Query("SELECT u FROM User u " +
            "WHERE u.major.id = :id " +
            "AND u.enabled = true " +
            "AND u.role.id = 2")
    List<User> findDoctorByMajor(@Param("id") Long id);

    

}

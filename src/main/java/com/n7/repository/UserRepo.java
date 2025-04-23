package com.n7.repository;

import com.n7.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsername(String username);

    User findByGmailAndEnabled(String email,boolean enable);

    User findByGmailAndEnabledAndCaptcha(String email,boolean enable,String captcha);

    @Query("SELECT u FROM User u " +
            "WHERE (:id IS NULL OR u.major.id = :id) " +
            "AND (:enabled IS NULL OR u.enabled = :enabled) " +
            "AND (:fullname IS NULL OR u.fullname LIKE %:fullname%)")
    Page<User> findByCustom(Long id, Boolean enabled, String fullname, Pageable pageable);

}

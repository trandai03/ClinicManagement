package com.n7.repository;

import com.n7.constant.RoleName;
import com.n7.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepo extends JpaRepository<Role, Long> {
    Role findByName(RoleName name);
}
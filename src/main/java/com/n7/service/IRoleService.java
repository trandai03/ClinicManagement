package com.n7.service;

import com.n7.constant.RoleName;
import com.n7.dto.RoleDTO;
import com.n7.entity.Role;
import com.n7.model.RoleModel;

public interface IRoleService {
    RoleModel convertEntityToModel(Role role);
    void deleteRole(Long id);
    boolean saveRole(RoleDTO roleDTO, Long id);
    boolean findById(Long id);
    boolean checkNameExits(RoleName name);
}

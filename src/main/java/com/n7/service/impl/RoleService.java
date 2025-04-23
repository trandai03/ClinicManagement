package com.n7.service.impl;

import com.n7.constant.RoleName;
import com.n7.dto.RoleDTO;
import com.n7.entity.Role;
import com.n7.model.RoleModel;
import com.n7.repository.RoleRepo;
import com.n7.service.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService implements IRoleService {
    private final RoleRepo roleRepo;

    public List<RoleModel> getAll() {
        return roleRepo.findAll().stream().map(this::convertEntityToModel).collect(Collectors.toList());
    }

    public boolean checkNameExits(RoleName name) {
        return roleRepo.findByName(name) != null;
    }

    public boolean findById(Long id) {
        return roleRepo.findById(id) != null;
    }

    public boolean saveRole(RoleDTO roleDTO,Long id) {
        Role role = new Role();
        if(id!=null) role.setId(id);
        convertDtoToEntity(role,roleDTO);
        return roleRepo.save(role) != null;
    }

    public void deleteRole(Long id) {
        roleRepo.deleteById(id);
    }

    public RoleModel convertEntityToModel(Role role) {
        RoleModel roleModel = new RoleModel();
        roleModel.setId(role.getId());
        roleModel.setName(role.getName().toString());
        roleModel.setDescription(role.getDescription());
        return roleModel;
    }

    public void convertDtoToEntity(Role role,RoleDTO roleDTO) {
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
    }
}

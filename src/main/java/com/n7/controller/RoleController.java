package com.n7.controller;

import com.n7.constant.RoleName;
import com.n7.dto.MajorDTO;
import com.n7.dto.RoleDTO;
import com.n7.model.RoleModel;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRole() {
        try{
            List<RoleModel> list = roleService.getAll();
            return ResponseEntity.ok().body(new SuccessResponse<>("Get success",list));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @PostMapping(value = "role")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> creatRole(@Valid @RequestBody RoleDTO roleDTO){
        try{
            if(roleService.checkNameExits(roleDTO.getName())){
                return ResponseEntity.badRequest().body(new ErrorResponse<>("Tên role đã tồn tại"));
            }
            roleService.saveRole(roleDTO,null);
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã tạo role thành công"));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @PutMapping(value = "role/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateRole(@Valid @RequestBody RoleDTO roleDTO,
            @PathVariable("id") Long id) {
        try{
            if(!roleService.findById(id)){
                return ResponseEntity.badRequest().body(new ErrorResponse<>("Id role không tòn tại"));
            }
            roleService.saveRole(roleDTO,id);
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã cập thành công role co id: " + id));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @DeleteMapping(value = "role/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable("id") Long id) {
        try{
            if(!roleService.findById(id)){
                return ResponseEntity.badRequest().body(new ErrorResponse<>("Id role không tòn tại"));
            }
            roleService.deleteRole(id);
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã xóa thành công role có id: " + id));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }


}

package com.n7.service;

import com.n7.dto.UserDTO;
import com.n7.entity.User;
import com.n7.model.UserModel;
import com.n7.request.LoginRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IUserService {
    Map<String,String> login(LoginRequest loginRequest);
    boolean checkName(String name);
    void resetPass(String pass, Long id);
    void restore(Long id);
    List<UserModel> getAllDoctorBy(Long majorId, String name, Pageable pageable, String status);
    Optional<UserModel> getDoctorById(Long id);
    void saveDoctor(UserDTO userDTO, String image, String idImage);
    void deleteDoctor(Long id);
    void updateDoctor(UserDTO userDTO, Long id, String image, String idImage);
    UserModel convertEntityToModel(User user);
    void convertDTOtoEntity(UserDTO userDTO, User user);
}

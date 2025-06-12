package com.n7.service.impl;

import com.n7.constant.RoleName;
import com.n7.dto.ArticleDTO;
import com.n7.dto.UserDTO;
import com.n7.entity.*;
import com.n7.exception.ResourceAlreadyExitsException;
import com.n7.exception.ResourceNotFoundException;
import com.n7.model.CustomUserDetail;
import com.n7.model.DoctorRankModel;
import com.n7.model.MajorModel;
import com.n7.model.UserModel;
import com.n7.repository.*;
import com.n7.request.LoginRequest;
import com.n7.request.RegisterRequest;
import com.n7.request.OTPVerificationRequest;
import com.n7.request.ResendOTPRequest;
import com.n7.service.IUserService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final MajorRepo majorRepo;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;
    private final ProfileService profileService;
    private final ProfileRepo profileRepo;
    private final DoctorRankRepository doctorRankRepository;
    // private final RedisService redisService;

    public Map<String, Object> login(LoginRequest loginRequest) {
        try {
            Map<String, Object> map = new HashMap<>();
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken((CustomUserDetail) userDetails);
            map.put("accessToken", jwt);
            map.put("roleId", String.valueOf(((CustomUserDetail) userDetails).getRoleId()));
            map.put("userId", String.valueOf(((CustomUserDetail) userDetails).getUserId()));
            map.put("fullName", userRepo.findById(((CustomUserDetail) userDetails).getUserId()).get().getFullname());
            Profile profile = profileRepo.findByUserId(((CustomUserDetail) userDetails).getUserId());
            map.put("profile", profile);
            return map;
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    public void logout(String token) {
        // if(!redisService.exists(token) && jwtService.isValidToken(token)){
        // redisService.set(token,"");
        // redisService.setTimeToLive(token,5); // remove token from redis in 5 minute
        // }
    }

    // @Transactional
    // public UserModel register(UserDTO userDTO) {
    // Optional<Role> role = roleRepo.findById(1L);
    // if(!role.isPresent()) throw new ResourceNotFoundException("Invalid id role");
    // User u = new User();
    // u.setPassword(passwordEncoder.encode(userDTO.getPassword()));
    // u.setUsername(userDTO.getUserName());
    // u.setFullname(userDTO.getFullName());
    // u.setRole(role.get());
    // u.setEnabled(true);
    // UserModel userModel = convertEntityToModel(u);
    // userRepo.save(u);
    // return userModel;
    // }

    public boolean checkName(String name) {
        return userRepo.findByUsername(name) != null;
    }

    public void resetPass(String pass, Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Not found Doctor with id :" + id));
        user.setPassword(passwordEncoder.encode(pass));
        userRepo.save(user);
    }

    public void restore(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Not found Doctor with id :" + id));
        user.setEnabled(true);
        userRepo.save(user);
    }

    public List<UserModel> getAllDoctorBy(Long majorId, String name, Pageable pageable, String status) {
        Boolean enabled = null;
        if (status != null)
            enabled = status.equals("true");
        return userRepo.findByCustom(majorId, enabled, name, pageable)
                .getContent().stream()
                .filter(e -> e.getRole().getId() != 1 && e.getRole().getId() != 3)
                .map(this::convertEntityToModel).collect(Collectors.toList());
    }

    public Optional<UserModel> getDoctorById(Long id) {
        return userRepo.findById(id).map(this::convertEntityToModel);
    }

    @Transactional
    public void saveDoctor(UserDTO userDTO, String image, String idImage) {
        User user = new User();
        Role role = roleRepo.findById(2L).get();
        Major major = majorRepo.findById(userDTO.getMajorId()).get();
        user.setRole(role);
        user.setMajor(major);
        convertDTOtoEntity(userDTO, user);
        if (idImage != null && image != null) {
            user.setUrlId(idImage);
            user.setAvatar(image);
        }
        user.setTrangthai("dl");
        user.setEnabled(true);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setDoctorRank(doctorRankRepository.findById(userDTO.getDoctorRankId()).get());
        userRepo.save(user);
    }

    @Transactional
    public void updateDoctor(UserDTO userDTO, Long id, String image, String idImage) {
        User user = userRepo.findById(id).get();
        if (user.getUsername().equals(userDTO.getUserName()) == false
                && userRepo.findByUsername(userDTO.getUserName()) != null) {
            throw new ResourceAlreadyExitsException("UserName đã bị trùng");
        }
        if (image != null && idImage != null) {
            user.setUrlId(idImage);
            user.setAvatar(image);
        }
        Major major = majorRepo.findById(userDTO.getMajorId()).get();
        if (major == null) {
            throw new ResourceNotFoundException("Không tìm thấy khoa cần lưu");
        } else
            user.setMajor(major);
        convertDTOtoEntity(userDTO, user);
        if (!userDTO.getTrangthai().equals("dl")) {
            user.setEnabled(false);
            user.setTrangthai(userDTO.getTrangthai());
        } else {
            user.setTrangthai("dl");
            user.setEnabled(true);
        }
        DoctorRank doctorRank = doctorRankRepository.findById(userDTO.getDoctorRankId()).get();
        if(doctorRank == null){
            throw new ResourceNotFoundException("Không tìm thấy cấp bậc bác sĩ cần lưu");
        }else{
            user.setDoctorRank(doctorRank);
        }
        userRepo.save(user);
    }

    @Transactional
    public void createUse(LoginRequest loginRequest) throws MessagingException {
        String captcha = UUID.randomUUID().toString().substring(0, 6);
        User user = userRepo.findByGmailAndEnabled(loginRequest.getGmail(), true);

        if (user == null) {
            user = new User();
            user.setGmail(loginRequest.getGmail());
            user.setUsername(loginRequest.getGmail());
            user.setPhone(loginRequest.getPhone());
            user.setEnabled(true);
            user.setPassword(passwordEncoder.encode("123456"));
            Role role = roleRepo.findByName(RoleName.ROLE_USER);
            user.setRole(role);
        }
        user.setCaptcha(captcha);
        userRepo.save(user);
        if (user.getProfile() == null) {
            Profile profile = new Profile();
            profile.setUser(user);
            profile.setGmail(loginRequest.getGmail());
            profileRepo.save(profile);
            user.setProfile(profile);
            userRepo.save(user);
        }
        mailService.sendMail(loginRequest.getGmail(), "Xác thực đăng nhập", "<h2>Mã capcha: " + captcha + " </h2>");
    }

    public Map<String, Object> validateCaptcha(LoginRequest loginRequest) {
        User user = userRepo.findByGmailAndEnabledAndCaptcha(loginRequest.getGmail(), true, loginRequest.getCaptcha());
        if (user != null) {
            Map<String, Object> map = new HashMap<>();
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getGmail(), "123456"));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken((CustomUserDetail) userDetails);
            map.put("accessToken", jwt);
            map.put("roleId", String.valueOf(((CustomUserDetail) userDetails).getRoleId()));
            map.put("userId", String.valueOf(((CustomUserDetail) userDetails).getUserId()));
            Profile profile = profileRepo.findByUserId(user.getId());
            map.put("profile", profile);
            return map;
        } else {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Transactional
    public void deleteDoctor(Long id) {
        User user = userRepo.findById(id).get();
        // if(user.isEnabled()==true) {
        // user.setEnabled(false);
        // userRepo.save(user);
        // }
        // else {
        // userRepo.deleteById(id);
        // }
        userRepo.deleteById(id);
    }

    public void convertDTOtoEntity(UserDTO userDTO, User user) {
        user.setFullname(userDTO.getFullName());
        user.setUsername(userDTO.getUserName());
        user.setGmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setDescription(userDTO.getDescription());
    }

    public UserModel convertEntityToModel(User user) {
        MajorModel majorModel = new MajorModel();
        if (user.getMajor() != null) {
            majorModel.setId(user.getMajor().getId());
            majorModel.setName(user.getMajor().getName());
        }
        DoctorRankModel doctorRankModel = new DoctorRankModel();
        if(user.getDoctorRank() != null){
            doctorRankModel.setId(user.getDoctorRank().getId());
            doctorRankModel.setCode(user.getDoctorRank().getCode());
            doctorRankModel.setName(user.getDoctorRank().getName());
            doctorRankModel.setBasePrice(user.getDoctorRank().getBasePrice());
        }
        UserModel userModel = new UserModel(user.getId(), user.getAvatar(), user.getFullname(), user.getUsername(),
                user.getPhone(),
                user.getGmail(), user.getDescription(), user.getRole().getId(), user.isEnabled(), majorModel,doctorRankModel,
                user.getTrangthai());
        return userModel;
    }

    // Thêm các method mới cho register với OTP
    @Transactional
    public Map<String, Object> registerUser(RegisterRequest registerRequest) {
        try {
            // Kiểm tra username đã tồn tại
            if (checkName(registerRequest.getUsername())) {
                throw new ResourceAlreadyExitsException("Tên đăng nhập đã tồn tại");
            }

            // Kiểm tra email hoặc phone đã tồn tại
            User existingUser = null;
            if (registerRequest.getEmail() != null) {
                existingUser = userRepo.findByGmailAndEnabled(registerRequest.getEmail(), true);
                if (existingUser != null) {
                    throw new ResourceAlreadyExitsException("Email đã được sử dụng");
                }
            }
            if (registerRequest.getPhone() != null) {
                existingUser = userRepo.findByPhoneAndEnabled(registerRequest.getPhone(), true);
                if (existingUser != null) {
                    throw new ResourceAlreadyExitsException("Số điện thoại đã được sử dụng");
                }
            }

            // Tạo user mới (chưa enabled)
            User user = new User();
            user.setFullname(registerRequest.getFullName());
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setGmail(registerRequest.getEmail());
            user.setPhone(registerRequest.getPhone());
            user.setEnabled(false); // Chưa kích hoạt, chờ OTP verification

            // Set role mặc định là USER
            Role role = roleRepo.findById(3L)
                    .orElseThrow(() -> new ResourceNotFoundException("Role USER không tồn tại"));
            user.setRole(role);

            // Tạo OTP
            String otp = generateOTP();
            user.setOtp(otp);
            user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10)); // OTP hết hạn sau 10 phút

            userRepo.save(user);

            // Gửi OTP qua email hoặc SMS
            sendOTP(user, otp);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Mã xác thực đã được gửi");
            response.put("contactMethod",
                    registerRequest.getEmail() != null ? registerRequest.getEmail() : registerRequest.getPhone());

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi trong quá trình đăng ký: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> verifyOTP(OTPVerificationRequest otpRequest) {
        try {
            User user = null;

            // Tìm user theo email hoặc phone
            if (otpRequest.getEmail() != null) {
                user = userRepo.findByGmailAndEnabled(otpRequest.getEmail(), false);
            } else if (otpRequest.getPhone() != null) {
                user = userRepo.findByPhoneAndEnabled(otpRequest.getPhone(), false);
            }

            if (user == null) {
                throw new ResourceNotFoundException("Không tìm thấy tài khoản chờ xác thực");
            }

            // Kiểm tra OTP
            if (!user.isOTPValid(otpRequest.getOtp())) {
                if (user.isOTPExpired()) {
                    throw new BadCredentialsException("Mã OTP đã hết hạn");
                } else {
                    throw new BadCredentialsException("Mã OTP không chính xác");
                }
            }

            // Kích hoạt tài khoản
            user.setEnabled(true);
            user.clearOTP();
            userRepo.save(user);

            // Tạo profile mặc định
            if (user.getProfile() == null) {
                Profile profile = new Profile();
                profile.setUser(user);
                profile.setGmail(user.getGmail());
                profileRepo.save(profile);
                user.setProfile(profile);
                userRepo.save(user);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đăng ký thành công");
            response.put("userId", user.getId());

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi trong quá trình xác thực: " + e.getMessage());
        }
    }

    public Map<String, Object> resendOTP(ResendOTPRequest resendRequest) {
        try {
            User user = null;

            // Tìm user theo email hoặc phone
            if (resendRequest.getEmail() != null) {
                user = userRepo.findByGmailAndEnabled(resendRequest.getEmail(), false);
            } else if (resendRequest.getPhone() != null) {
                user = userRepo.findByPhoneAndEnabled(resendRequest.getPhone(), false);
            }

            if (user == null) {
                throw new ResourceNotFoundException("Không tìm thấy tài khoản chờ xác thực");
            }

            // Tạo OTP mới
            String newOTP = generateOTP();
            user.setOtp(newOTP);
            user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
            userRepo.save(user);

            // Gửi OTP mới
            sendOTP(user, newOTP);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Mã xác thực mới đã được gửi");

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi lại OTP: " + e.getMessage());
        }
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Tạo số 6 chữ số
        return String.valueOf(otp);
    }

    private void sendOTP(User user, String otp) {
        try {
            if (user.getGmail() != null && !user.getGmail().isEmpty()) {
                // Gửi OTP qua email
                String subject = "Mã xác thực đăng ký tài khoản";
                String body = String.format(
                        "<h2>Xin chào %s!</h2>" +
                                "<p>Mã xác thực của bạn là: <strong>%s</strong></p>" +
                                "<p>Mã này sẽ hết hạn sau 10 phút.</p>" +
                                "<p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>",
                        user.getFullname(), otp);
                mailService.sendMail(user.getGmail(), subject, body);
            } else if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                // TODO: Implement SMS service để gửi OTP qua SMS
                // Hiện tại có thể log hoặc sử dụng service SMS khác
                System.out.println("Send SMS OTP to " + user.getPhone() + ": " + otp);
            }
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi mã OTP: " + e.getMessage());
        }
    }
}

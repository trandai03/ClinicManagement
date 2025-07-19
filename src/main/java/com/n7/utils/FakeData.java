package com.n7.utils;

import com.github.javafaker.Faker;
import com.n7.constant.Gender;
import com.n7.constant.Status;
import com.n7.constant.UnitMedicine;
import com.n7.entity.*;
import com.n7.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * FakeData Generator for DoAnTN Medical Clinic Management System
 * 
 * Tạo dữ liệu mẫu cho hệ thống quản lý phòng khám y tế sử dụng JavaFaker.
 * Dữ liệu được tạo bao gồm:
 * - 200 booking records với trạng thái đa dạng (SUCCESS 71%, các trạng thái khác 29%)
 * - History records cho các booking SUCCESS
 * - Prescription records (2-5 thuốc mỗi history)
 * - ServiceRequest records (1-3 dịch vụ mỗi booking)
 * - Bác sĩ (2-3 bác sĩ mỗi chuyên khoa)
 * - 20 loại thuốc cơ bản
 * - 15 dịch vụ y tế
 * - 12 bài viết y tế
 * 
 * Configuration:
 * - Bật/tắt thông qua app.fake-data.enabled trong application.properties
 * - Chỉ tạo khi số lượng booking < 50
 * - Dữ liệu được phân phối đều trong 8 tháng qua (2024-2025)
 * 
 * @author DoAnTN Team
 * @version 1.0
 * @since 2025-01-01
 */
@Component
public class FakeData {
    
    @Value("${app.fake-data.enabled:false}")
    private boolean fakeDataEnabled;
    
    @Autowired
    private BookingRepo bookingRepo;
    
    @Autowired
    private HistoryRepo historyRepo;
    
    @Autowired
    private PrescriptionRepository prescriptionRepo;
    
    @Autowired
    private ServiceRequestRepository serviceRequestRepo;
    
    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private MajorRepo majorRepo;
    
    @Autowired
    private MedicineRepo medicineRepo;
    
    @Autowired
    private MedicalServiceRepo medicalServiceRepo;
    
    @Autowired
    private HourRepo hourRepo;
    
    @Autowired
    private DoctorRankRepository doctorRankRepo;
    
    @Autowired
    private RoleRepo roleRepo;
    
    @Autowired
    private DoctorScheduleRepository doctorScheduleRepo;
    
    @Autowired
    private ArticleRepo articleRepo;
    
    private final Faker faker = new Faker(new Locale("vi"));
    
    @PostConstruct
    public void fakeData() {
        // Kiểm tra xem có được phép tạo fake data không
        if (!fakeDataEnabled) {
            System.out.println("⚠️ Fake data bị tắt. Bật bằng cách set app.fake-data.enabled=true");
            return;
        }
        
        // Chỉ tạo fake data nếu chưa có dữ liệu
        if (bookingRepo.count() < 200) {
            System.out.println("🚀 Bắt đầu tạo fake data...");
            
            // Tạo dữ liệu cơ sở trước
            createDoctorsIfNeeded();
//            createBasicMedicines();
//            createBasicMedicalServices();
//            createArticlesIfNeeded();
            
            // Tạo dữ liệu chính có liên kết
            createBookingsWithRelatedData();
            
            System.out.println("✅ Hoàn thành tạo fake data!");
        } else {
            System.out.println("ℹ️ Đã có đủ dữ liệu booking, bỏ qua tạo fake data");
        }
    }
    
    private void createDoctorsIfNeeded() {
//        Role role = roleRepo.findById(2L).get();
        List<User> doctors = userRepo.findDoctor(null,null);
        List<Major> majors = majorRepo.findAll();
        
        if (doctors.size() < 15 && !majors.isEmpty()) {
            System.out.println("👨‍⚕️ Tạo thêm bác sĩ cho các chuyên khoa...");
            
            Role doctorRole = roleRepo.findById(2L).orElse(null);
            if (doctorRole == null) {
                System.out.println("⚠️ Không tìm thấy role bác sĩ (id=2)");
                return;
            }
            
            List<DoctorRank> doctorRanks = doctorRankRepo.findAll();
            if (doctorRanks.isEmpty()) {
                System.out.println("⚠️ Không có doctor rank trong database");
                return;
            }
            
            String[] doctorNames = {
                "BS. Nguyễn Văn An", "BS. Trần Thị Bình", "BS. Lê Hoàng Cường", 
                "BS. Phạm Thị Dung", "BS. Hoàng Văn Đức", "BS. Vũ Thị Lan",
                "BS. Đặng Minh Hải", "BS. Ngô Thị Hương", "BS. Bùi Văn Khoa",
                "BS. Lý Thị Mai", "BS. Trương Văn Nam", "BS. Đinh Thị Oanh",
                "BS. Phan Văn Phúc", "BS. Tạ Thị Quỳnh", "BS. Lưu Văn Sơn",
                "BS. Cao Thị Thảo", "BS. Võ Văn Tùng", "BS. Đỗ Thị Uyên",
                "BS. Huỳnh Văn Vinh", "BS. Chu Thị Xuân"
            };
            
            // Tạo 2-3 bác sĩ cho mỗi chuyên khoa
            int doctorIndex = 0;
            for (Major major : majors) {
                int doctorsPerMajor = faker.number().numberBetween(2, 4);
                
                for (int i = 0; i < doctorsPerMajor && doctorIndex < doctorNames.length; i++) {
                    String doctorName = doctorNames[doctorIndex++];
                    
                    User doctor = new User();
                    doctor.setFullname(doctorName);
                    doctor.setUsername("doctor" + doctorIndex);
                    doctor.setPassword("$2a$10$encrypted_password"); // Mật khẩu mã hóa
                    doctor.setPhone("0" + faker.number().numberBetween(100000000, 999999999));
                    doctor.setGmail(faker.internet().emailAddress());
                    doctor.setAvatar("https://via.placeholder.com/150");
                    doctor.setTrangthai("active");
                    doctor.setDescription(faker.lorem().sentence(10));
                    doctor.setRole(doctorRole);
                    doctor.setMajor(major);
                    doctor.setDoctorRank(doctorRanks.get(faker.number().numberBetween(0, doctorRanks.size())));
                    
                    userRepo.save(doctor);
                }
            }
            
            System.out.println("✅ Đã tạo thêm " + (doctorIndex) + " bác sĩ");
        }
    }
    
//    private void createArticlesIfNeeded() {
//        if (articleRepo.count() < 10) {
//            System.out.println("📰 Tạo bài viết y tế...");
//
//            String[] articleTitles = {
//                "10 cách phòng ngừa bệnh tim mạch hiệu quả",
//                "Chế độ ăn uống khoa học cho người tiểu đường",
//                "Tầm quan trọng của việc khám sức khỏe định kỳ",
//                "Cách nhận biết các dấu hiệu cảnh báo ung thư",
//                "Bí quyết giữ sức khỏe tinh thần tốt",
//                "Hướng dẫn chăm sóc sức khỏe người cao tuổi",
//                "Vaccine - Khiên chắn bảo vệ sức khỏe cộng đồng",
//                "Tác hại của thuốc lá đối với sức khỏe",
//                "Cách xử lý cấp cứu khi bị đột quỵ",
//                "Dinh dưỡng hợp lý cho trẻ em phát triển khỏe mạnh",
//                "Stress và cách quản lý căng thẳng hiệu quả",
//                "Tầm quan trọng của giấc ngủ đối với sức khỏe"
//            };
//
//            for (String title : articleTitles) {
//                Article article = new Article();
//                article.setTitle(title);
//                article.setContent(faker.lorem().paragraph(20));
//                article.setImage("https://via.placeholder.com/600x400");
//                article.setCreateAt(faker.date().past(90, TimeUnit.DAYS));
//                article.setUpdateAt(new Date());
//                article.setViews(faker.number().numberBetween(100, 5000));
//                article.setStatus("PUBLISHED");
//
//                articleRepo.save(article);
//            }
//
//            System.out.println("✅ Đã tạo " + articleTitles.length + " bài viết");
//        }
//    }
    
    private void createBasicMedicines() {
        if (medicineRepo.count() < 20) {
            System.out.println("📋 Tạo danh sách thuốc...");
            
            String[] medicineNames = {
                "Paracetamol", "Ibuprofen", "Amoxicillin", "Aspirin", "Metformin",
                "Omeprazole", "Atorvastatin", "Losartan", "Amlodipine", "Simvastatin",
                "Cephalexin", "Azithromycin", "Doxycycline", "Prednisone", "Furosemide",
                "Hydrochlorothiazide", "Lisinopril", "Gabapentin", "Tramadol", "Ciprofloxacin"
            };
            
            UnitMedicine[] units = UnitMedicine.values();
            
            for (String name : medicineNames) {
                Medicine medicine = Medicine.builder()
                    .name(name)
                    .quantity(faker.number().numberBetween(50L, 1000L))
                    .money(faker.number().numberBetween(5000L, 200000L))
                    .unit(units[faker.number().numberBetween(0, units.length)])
                    .description(faker.lorem().sentence(10))
                    .build();
                
                medicineRepo.save(medicine);
            }
            
            System.out.println("✅ Đã tạo " + medicineNames.length + " loại thuốc");
        }
    }
    
    private void createBasicMedicalServices() {
        if (medicalServiceRepo.count() < 15) {
            System.out.println("🏥 Tạo danh sách dịch vụ y tế...");
            
            String[] serviceNames = {
                "Xét nghiệm máu tổng quát", "Chụp X-quang ngực", "Siêu âm bụng tổng quát",
                "Điện tim", "Xét nghiệm nước tiểu", "Chụp CT Scanner", "Nội soi dạ dày",
                "Xét nghiệm sinh hóa", "Chụp MRI", "Xét nghiệm vi sinh", "Đo mật độ xương",
                "Holter điện tim 24h", "Xét nghiệm hormone", "Chụp mammography", "Xét nghiệm ung thư"
            };
            
            for (String name : serviceNames) {
                MedicalService service = MedicalService.builder()
                    .name(name)
                    .money(faker.number().numberBetween(100000L, 2000000L))
                    .description(faker.lorem().sentence(8))
                    .build();
                
                medicalServiceRepo.save(service);
            }
            
            System.out.println("✅ Đã tạo " + serviceNames.length + " dịch vụ y tế");
        }
    }
    
    private void createBookingsWithRelatedData() {
        System.out.println("📅 Tạo booking và dữ liệu liên quan...");
        
        // Lấy dữ liệu cần thiết
        List<User> doctors = userRepo.findDoctor(null,null); // Role bác sĩ
        List<Major> majors = majorRepo.findAll();
        List<Hour> hours = hourRepo.findAll();
        List<Medicine> medicines = medicineRepo.findAll();
        List<MedicalService> medicalServices = medicalServiceRepo.findAll();
        
        if (doctors.isEmpty() || majors.isEmpty() || hours.isEmpty()) {
            System.out.println("⚠️ Cần có dữ liệu bác sĩ, chuyên khoa và giờ trước khi tạo booking!");
            return;
        }
        
        // Tạo 200 booking trong 6 tháng qua
        for (int i = 0; i < 200; i++) {
            // Tạo booking
            Booking booking = createRandomBooking(doctors, majors, hours);
            booking = bookingRepo.save(booking);
            
            // Nếu booking SUCCESS, tạo history và các dữ liệu liên quan
            if (booking.getStatus() == Status.SUCCESS) {
                History history = createHistoryForBooking(booking);
                history = historyRepo.save(history);
                
                // Tạo đơn thuốc (2-5 loại thuốc)
                createPrescriptionsForHistory(history, medicines);
                
                // Tạo yêu cầu dịch vụ (1-3 dịch vụ)
                createServiceRequestsForBooking(booking, history, medicalServices);
            }
            
            if ((i + 1) % 50 == 0) {
                System.out.println("📊 Đã tạo " + (i + 1) + " booking...");
            }
        }
        
        System.out.println("✅ Hoàn thành tạo booking và dữ liệu liên quan!");
    }
    
    private Booking createRandomBooking(List<User> doctors, List<Major> majors, List<Hour> hours) {
        User doctor = doctors.get(faker.number().numberBetween(0, doctors.size()));
        Major major = majors.get(faker.number().numberBetween(0, majors.size()));
        Hour hour = hours.get(faker.number().numberBetween(0, hours.size()));
        
        // Tạo ngày phân phối đều trong 8 tháng qua để có dữ liệu cho 2024-2025
        Date bookingDate = faker.date().past(240, TimeUnit.DAYS);
        
        // Tăng tỷ lệ SUCCESS để có nhiều dữ liệu thống kê hơn
        Status[] statuses = {
            Status.SUCCESS, Status.SUCCESS, Status.SUCCESS, Status.SUCCESS, Status.SUCCESS, // 71% SUCCESS
            Status.CONFIRMING, Status.ACCEPTING, // 14% các trạng thái khác
            Status.IN_PROGRESS, Status.CANCELLED
        };
        Status status = statuses[faker.number().numberBetween(0, statuses.length)];
        
        // Đảm bảo bác sĩ thuộc đúng chuyên khoa (nếu có)
        if (doctor.getMajor() != null) {
            major = doctor.getMajor();
        }
        
        return Booking.builder()
            .fullName(faker.name().fullName())
            .dob(faker.date().birthday(18, 80))
            .phone("0" + faker.number().numberBetween(100000000, 999999999))
            .email(faker.internet().emailAddress())
            .gender(faker.bool().bool() ? Gender.MALE : Gender.FEMALE)
            .address(faker.address().fullAddress())
            .date(bookingDate)
            .idHour(hour.getId())
            .status(status)
            .note(faker.lorem().sentence(5))
            .initialSymptoms(getRandomSymptom())
            .token(UUID.randomUUID().toString())
            .totalAmount(faker.number().numberBetween(200000L, 2000000L))
            .roomNumber("P" + faker.number().numberBetween(101, 350))
            .startTime(status == Status.SUCCESS ? 
                LocalDateTime.ofInstant(bookingDate.toInstant(), ZoneId.systemDefault()).plusHours(faker.number().numberBetween(8, 17)) : null)
            .endTime(status == Status.SUCCESS ? 
                LocalDateTime.ofInstant(bookingDate.toInstant(), ZoneId.systemDefault()).plusHours(faker.number().numberBetween(8, 17)).plusMinutes(30) : null)
            .paidAt(status == Status.SUCCESS ? 
                LocalDateTime.ofInstant(bookingDate.toInstant(), ZoneId.systemDefault()).plusHours(faker.number().numberBetween(8, 18)) : null)
            .paymentStatus(status == Status.SUCCESS ? "PAID" : "PENDING")
            .paymentMethod(status == Status.SUCCESS ? (faker.bool().bool() ? "CASH" : "CARD") : null)
            .user(doctor)
            .build();
    }
    
    private String getRandomSymptom() {
        String[] symptoms = {
            "Đau đầu, chóng mặt", "Ho, sốt nhẹ", "Đau bụng, khó tiêu", 
            "Mệt mỏi, uể oải", "Đau ngực, khó thở", "Đau lưng, cứng cổ",
            "Mất ngủ, lo âu", "Đau khớp, sưng tấy", "Nôn mửa, tiêu chảy",
            "Đau răng, sưng nướu", "Mờ mắt, nhức mắt", "Đau họng, khàn tiếng",
            "Tê tay chân", "Phát ban, ngứa", "Khó nuốt, ợ hơi"
        };
        return symptoms[faker.number().numberBetween(0, symptoms.length)];
    }
    
    private History createHistoryForBooking(Booking booking) {
        return History.builder()
            .booking(booking)
            .medicalSummary(faker.lorem().paragraph(3))
            .diagnosis(faker.lorem().sentence(6))
            .treatment(faker.lorem().paragraph(2))
            .doctorNotes(faker.lorem().sentence(8))
            .examinationDate(booking.getStartTime())
            .startTime(booking.getStartTime())
            .endTime(booking.getEndTime())
            .consultationFee(faker.number().numberBetween(200000L, 500000L))
            .medicineFee(faker.number().numberBetween(100000L, 800000L))
            .serviceFee(faker.number().numberBetween(200000L, 1000000L))
            .totalAmount(booking.getTotalAmount())
            .build();
    }
    
    private void createPrescriptionsForHistory(History history, List<Medicine> medicines) {
        int prescriptionCount = faker.number().numberBetween(2, 6);
        Set<Long> usedMedicineIds = new HashSet<>();
        
        for (int i = 0; i < prescriptionCount; i++) {
            Medicine medicine;
            do {
                medicine = medicines.get(faker.number().numberBetween(0, medicines.size()));
            } while (usedMedicineIds.contains(medicine.getId()));
            
            usedMedicineIds.add(medicine.getId());
            
            int quantity = faker.number().numberBetween(1, 5);
            Long unitPrice = medicine.getMoney();
            
            Prescription prescription = Prescription.builder()
                .historyId(history.getId())
                .medicine(medicine)
                .quantity(quantity)
                .dosage(faker.number().numberBetween(1, 3) + " viên/lần, " + faker.number().numberBetween(1, 3) + " lần/ngày")
                .instructions(faker.lorem().sentence(6))
                .unitPrice(unitPrice)
                .totalPrice(unitPrice * quantity)
                .build();
            
            prescriptionRepo.save(prescription);
        }
    }
    
    private void createServiceRequestsForBooking(Booking booking, History history, List<MedicalService> medicalServices) {
        int serviceCount = faker.number().numberBetween(1, 4);
        Set<Long> usedServiceIds = new HashSet<>();
        
        for (int i = 0; i < serviceCount; i++) {
            MedicalService service;
            do {
                service = medicalServices.get(faker.number().numberBetween(0, medicalServices.size()));
            } while (usedServiceIds.contains(service.getId()));
            
            usedServiceIds.add(service.getId());
            
            String[] serviceTypes = {"MEDICAL_SERVICE", "LAB_TEST"};
//            String[] statuses = {"REQUEST", "COMPLETED", "PENDING", "IN_PROGRESS"};
            
            ServiceRequest serviceRequest = ServiceRequest.builder()
                .booking(booking)
                .history(history)
                .medicalService(service)
                .serviceType(serviceTypes[faker.number().numberBetween(0, serviceTypes.length)])
                .status("COMPLETED")
                .requestNotes(faker.lorem().sentence(5))
                .resultNotes(faker.lorem().sentence(8))
                .cost(service.getMoney())
                .requestedAt(booking.getStartTime())
                .completedAt(faker.bool().bool() ? booking.getEndTime() : null)
                .labComment(faker.lorem().sentence(4))
                .build();
            
            serviceRequestRepo.save(serviceRequest);
        }
    }
}

package com.n7.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.n7.dto.MajorDTO;
import com.n7.entity.Major;
import com.n7.exception.ResourceAlreadyExitsException;
import com.n7.model.MajorModel;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.CloudinaryService;
import com.n7.service.impl.MajorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class MajorController {
    private final CloudinaryService cloudinaryService;
    private final MajorService majorService;
    @PostMapping(value = "major")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createMajor(@RequestPart("file") MultipartFile multipartFile,
                                         @RequestPart("majordto") String object) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            byte[] bytesGiaiMa = Base64.getDecoder().decode(object);
            String giaiMaBase64 = new String(bytesGiaiMa);
            MajorDTO majorDTO = objectMapper.readValue(giaiMaBase64,MajorDTO.class);
            if(majorService.checkNameMajor(majorDTO.getName())){
                return ResponseEntity.badRequest().body(new ErrorResponse<>("Tên khoa đã tồn tại"));
            }
            Map data = cloudinaryService.upload(multipartFile);
            majorService.saveMajor(majorDTO,null,data.get("url").toString(),data.get("public_id").toString());
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã tạo thành công"));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @PutMapping(value = "major/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateMajor(@RequestPart(value = "file",required = false) MultipartFile multipartFile,
                                         @RequestPart(value = "majordto") String object,
                                         @PathVariable("id") Long id) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            byte[] bytesGiaiMa = Base64.getDecoder().decode(object);
            String giaiMaBase64 = new String(bytesGiaiMa);
            MajorDTO majorDTO = objectMapper.readValue(giaiMaBase64,MajorDTO.class);
            String image = null, idImage = null;
            Major major = majorService.findById(id).get();
            if(major==null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse<>("Khoa không tồn tại!!!"));
            }
            if(multipartFile!=null){
                Map data = cloudinaryService.upload(multipartFile);
                cloudinaryService.delete(major.getIdImage());
                image = data.get("url").toString();
                idImage = data.get("public_id").toString();
                majorService.updateMajor(majorDTO,id,image,idImage);
            }
            majorService.updateMajor(majorDTO,id,null,null);
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã cập nhật thành công"));
        }
        catch (ResourceAlreadyExitsException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse<>(ex.getMessage()));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping(value = "majors")
    public ResponseEntity<?> getAllMajor() {
        try{
            List<MajorModel> list = majorService.getAll();
            return ResponseEntity.ok(new SuccessResponse<>("Get success",list));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }

    @DeleteMapping(value = "major/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteMajor(@PathVariable("id") Long id) {
        try{
            Optional<Major> major = majorService.findById(id);
            if(!major.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse<>("Id khoa không tồn tại!!!"));
            }
            majorService.deleteMajor(id);
            cloudinaryService.delete(major.get().getIdImage());
            return ResponseEntity.ok().body(new SuccessResponse<>("Đã xóa thành công khoa có id: " + id));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(e.getMessage()));
        }
    }
}

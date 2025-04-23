package com.n7.controller;

import com.n7.dto.ContactDTO;
import com.n7.entity.Contact;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class ContactController {
    private final ContactService contactService;
    @GetMapping("contacts")
    public ResponseEntity<?> getAllContact() {
        try{
            List<Contact> list = contactService.getAllContacts();
            return ResponseEntity.ok().body(new SuccessResponse<>("get data success",list));
        }catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>("Error!!!"));
        }
    }

    @PostMapping("contact")
    public ResponseEntity<?> creatContact(@Valid @RequestBody ContactDTO contactDTO) {
        try{
            Contact contact = contactService.saveContact(contactDTO);
            return ResponseEntity.ok().body(new SuccessResponse<>("ok nha"));
        }catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(ex.getMessage()));
        }
    }

    @DeleteMapping("contact/{id}")
    public ResponseEntity<?> deleteContact(@PathVariable("id") Long id) {
        try{
            contactService.deleteContact(id);
            return ResponseEntity.ok().body(new SuccessResponse<>("delete success"));
        }catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse<>(ex.getMessage()));
        }
    }

}

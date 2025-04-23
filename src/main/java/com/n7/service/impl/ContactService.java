package com.n7.service.impl;

import com.n7.dto.ContactDTO;
import com.n7.entity.Contact;
import com.n7.exception.ResourceNotFoundException;
import com.n7.repository.ContactRepo;
import com.n7.service.IContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService implements IContactService {
    private final ContactRepo contactRepo;
    public List<Contact> getAllContacts() {
        return contactRepo.findAll().stream().collect(Collectors.toList());
    }

    public Contact saveContact(ContactDTO contactDTO) {
        Contact contact = new Contact();
        contact.setDob(contactDTO.getDob());
        contact.setName(contactDTO.getName());
        contact.setGmail(contactDTO.getEmail());
        contact.setPhone(contactDTO.getPhone());
        contact.setNote(contactDTO.getNote());
        return contactRepo.save(contact);
    }
    public void deleteContact(Long id) {
        if(contactRepo.findById(id).isEmpty()) throw new ResourceNotFoundException("Khong tim thay id: " + id);
        contactRepo.deleteById(id);
    }
}

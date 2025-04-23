package com.n7.service;

import com.n7.dto.ContactDTO;
import com.n7.entity.Contact;

import java.util.List;

public interface IContactService {
    void deleteContact(Long id);
    Contact saveContact(ContactDTO contactDTO);
    List<Contact> getAllContacts();
}

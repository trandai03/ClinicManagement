package com.n7.exception;

public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String mess) {
        super(mess);
    }
}

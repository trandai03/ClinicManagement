package com.n7.exception;

public class ResourceAlreadyExitsException extends RuntimeException{
    public ResourceAlreadyExitsException(String message) {
        super(message);
    }
}

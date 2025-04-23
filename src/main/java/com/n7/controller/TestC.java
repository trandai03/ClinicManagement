package com.n7.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

public class TestC {
    public static void main(String[] args) {
        String key1 = "aLongSecretStringWhoseBitnessIsEqualToOrGreaterThanTheBitnessOfTheTokenEncryptionAlgorithm";
        SecretKey key = Keys.hmacShaKeyFor(key1.getBytes());
        String token = "eyJhbGciOiJIUzUxMiJ9.eyJ0eXBlVG9rZW4iOiJCZWFyZXIiLCJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW4iLCJyb2xlcyI6WyJST0xFX0FETUlOIl0sImV4cCI6MTcxODE1NDg4OSwiaWF0IjoxNzE4MTU0ODg4fQ.RmkcNR3pxR-NoJVY-HbLpMyTW9NhYbYmsHztoITg5yH6LC9YIvwzOR4RX3hiCGMsBGw7wxUVbn617BT6mQqNaA";
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        Date now = new Date();
        Date exp = claims.getExpiration();
        System.out.println(now.getTime() - exp.getTime());

    }
}

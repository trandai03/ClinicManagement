package com.n7.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class ConvertTimeUtils {
    public static String convertDate(Date date) {
        DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
        return dateFormat.format(date);
    }

    public static String convertLocalDatetime(LocalDateTime localDateTime) {
        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        return dateFormat.format(localDateTime).toString();
    }

    public static Date stringToDate(String s) {
        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        try {
            Date date = dateFormat.parse(s);
            System.out.println("gia tri ok: " + date);
            return date;
        } catch (ParseException e) {
            // e.printStackTrace();
            System.out.println("co loi parse" + e.getMessage());
            return null;
        }
    }

    public static Date stringToDate1(String s) {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        try {
            Date date = dateFormat.parse(s);
            System.out.println("gia tri ok: " + date);
            return date;
        } catch (ParseException e) {
            // e.printStackTrace();
            System.out.println("co loi parse" + e.getMessage());
            return null;
        }
    }

    // cho phu hop khi chuyen sang dang date trong js (MM/dd/yyyy)
    public static String dateToString(Date date) {
        DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
        return dateFormat.format(date);
    }

    // LocalDate utility methods
    public static LocalDate stringToLocalDate(String dateString) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return LocalDate.parse(dateString, formatter);
    }

    public static String localDateToString(LocalDate localDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return localDate.format(formatter);
    }
}

package com.n7.controller;

import com.n7.entity.Booking;
import com.n7.repository.BookingRepo;
import com.n7.response.ErrorResponse;
import com.n7.response.SuccessResponse;
import com.n7.service.impl.PaymentService;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/payments")
public class PaymentController {
    private final PaymentService paymentService;
    private final BookingRepo bookingRepo;

    @PostMapping
    public ResponseEntity<?> payment(@RequestParam Long bookingId,@RequestParam Long totalAmount) {
        try {
            System.out.println("bookingId"+ bookingId);
            System.out.println("totalAmount"+ totalAmount);
            Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
            BigDecimal amount = BigDecimal.valueOf(totalAmount);
            String payUrl = paymentService.payWithMoMo(
                UUID.randomUUID().toString().substring(0, 5), 
                amount,bookingId
            );
            System.out.println("payUrl" +payUrl);
            return ResponseEntity.ok(new SuccessResponse<>("Payment URL created successfully", payUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse<>("Error creating payment: " + e.getMessage()));
        }
    }

    @Hidden
    @PostMapping("/ipn/{bookingId}")
    public ResponseEntity<?> callBackMomo(
            @PathVariable Long bookingId,
            @RequestBody(required = false) String payload
    ) {
        try {
            // TODO: Implement MoMo IPN callback logic
            // 1. Verify signature from MoMo
            // 2. Update booking payment status
            // 3. Send confirmation back to MoMo
            
            System.out.println("MoMo IPN received for booking: " + bookingId);
            System.out.println("Payload: " + payload);
            
            return ResponseEntity.ok(new SuccessResponse<>("IPN processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse<>("Error processing IPN: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{bookingId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
            
            String paymentStatus = booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "PENDING";
            
            return ResponseEntity.ok(new SuccessResponse<>("Payment status retrieved", paymentStatus));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse<>("Error checking payment status: " + e.getMessage()));
        }
    }

    @PutMapping("/status/{bookingId}")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long bookingId,
            @RequestParam String status
    ) {
        try {
            Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
            
            booking.setPaymentStatus(status);
            bookingRepo.save(booking);
            
            return ResponseEntity.ok(new SuccessResponse<>("Payment status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse<>("Error updating payment status: " + e.getMessage()));
        }
    }
}

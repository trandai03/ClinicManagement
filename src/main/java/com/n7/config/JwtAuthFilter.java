package com.n7.config;

import com.n7.repository.UserRepo;
import com.n7.service.impl.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepo userRepository;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthFilter(JwtService jwtService, UserRepo userRepository, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("Request URI: " + path);

        // Bỏ qua filter cho các URL public
//        if (path.contains("/auth/login") || path.contains("/auth/register")) {
//            filterChain.doFilter(request, response);
//            return;
//        }

        String accessToken = request.getHeader("Authorization");

        try {
            if (accessToken != null && accessToken.startsWith("Bearer ")) {
                String token = accessToken.substring(7);
                if (jwtService.isValidToken(token)) {
                    Long userId = (long) jwtService.getIdFromToken(token);
                    UserDetails userDetails = userRepository.findById(userId)
                            .map(user -> userDetailsService.loadUserByUsername(user.getUsername()))
                            .orElseThrow(() -> new RuntimeException("User not found for ID: " + userId));
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Token expired\"}");
            return;
        } catch (JwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Invalid token\"}");
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Authentication failed\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

}
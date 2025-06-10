package com.backend.consentido.controller;

import com.backend.consentido.model.Usuario;
import com.backend.consentido.model.auth.LoginRequest;
import com.backend.consentido.model.auth.LoginResponse;
import com.backend.consentido.config.JwtUtil;
import com.backend.consentido.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Endpoint para login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getNombre(), request.getContrasena())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getNombre());
        String token = jwtUtil.generarToken(userDetails);

        return ResponseEntity.ok(new LoginResponse(token));
    }

    // Endpoint para registrar usuario
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        if (userDetailsService.usuarioExiste(usuario.getNombre())) {
            return ResponseEntity.status(409).body("El usuario ya existe.");
        }

        userDetailsService.registrarUsuario(usuario, passwordEncoder);
        return ResponseEntity.ok("Usuario registrado correctamente.");
    }
}

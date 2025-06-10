package com.backend.consentido.controller;

import com.backend.consentido.model.Usuario;
import com.backend.consentido.model.auth.LoginRequest;
import com.backend.consentido.model.auth.LoginResponse;
import com.backend.consentido.security.JwtUtil;
import com.backend.consentido.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Endpoint para autenticación de usuarios
     * @param request datos de login (nombre y contraseña)
     * @return token JWT si las credenciales son válidas
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Validar que los campos requeridos no estén vacíos
            if (request.getNombre() == null || request.getNombre().trim().isEmpty() ||
                request.getContrasena() == null || request.getContrasena().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre de usuario y la contraseña son requeridos");
            }

            // Autenticar al usuario
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getNombre(), request.getContrasena())
            );
            
            // Generar token JWT
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getNombre());
            String token = jwtUtil.generateToken(userDetails);

            // Devolver respuesta con token y datos básicos del usuario
            Map<String, Object> userData = new HashMap<>();
            Usuario usuario = userDetailsService.findByUsername(request.getNombre());
            if (usuario != null) {
                userData.put("id", usuario.getId());
                userData.put("nombre", usuario.getNombre());
                userData.put("email", usuario.getEmail());
                userData.put("rol", usuario.getRol());
            }
            
            return ResponseEntity.ok(new LoginResponse(token, userData));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Credenciales inválidas", 
                             "message", "Usuario o contraseña incorrectos"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error de autenticación", 
                             "message", e.getMessage()));
        }
    }

    /**
     * Endpoint para registro de nuevos usuarios
     * @param usuario datos del usuario a registrar
     * @return confirmación de registro exitoso o error
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            // Validar datos requeridos
            if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre de usuario es requerido"));
            }
            
            if (usuario.getContrasena() == null || usuario.getContrasena().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña es requerida"));
            }
            
            if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El email es requerido"));
            }

            // Verificar si el usuario ya existe
            if (userDetailsService.usuarioExiste(usuario.getNombre())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Usuario ya existe", 
                                "message", "El nombre de usuario ya está registrado"));
            }

            // Registrar el nuevo usuario
            Usuario nuevoUsuario = userDetailsService.registrarUsuario(usuario, passwordEncoder);
            
            // Si el registro fue exitoso, devolver datos básicos del usuario (sin contraseña)
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Usuario registrado correctamente");
            response.put("id", nuevoUsuario.getId());
            response.put("nombre", nuevoUsuario.getNombre());
            response.put("email", nuevoUsuario.getEmail());
            response.put("rol", nuevoUsuario.getRol());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error en el registro", 
                            "message", e.getMessage()));
        }
    }
    
    /**
     * Endpoint para verificar la validez de un token JWT
     * @param token el token JWT a verificar
     * @return información del usuario si el token es válido
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            if (username != null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtUtil.isTokenValid(token, userDetails)) {
                    Usuario usuario = userDetailsService.findByUsername(username);
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", true);
                    response.put("id", usuario.getId());
                    response.put("nombre", usuario.getNombre());
                    response.put("email", usuario.getEmail());
                    response.put("rol", usuario.getRol());
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "error", "Token inválido"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "error", "Token inválido", "message", e.getMessage()));
        }
    }
}
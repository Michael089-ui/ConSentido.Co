package com.backend.consentido.service;

import com.backend.consentido.model.Usuario;
import com.backend.consentido.repository.IUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String nombre) throws UsernameNotFoundException {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByNombre(nombre);

        if (usuarioOpt.isEmpty()) {
            throw new UsernameNotFoundException("Usuario no encontrado con nombre: " + nombre);
        }

        Usuario usuario = usuarioOpt.get();

        return new org.springframework.security.core.userdetails.User(
                usuario.getNombre(),
                usuario.getContrasena(),
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())
                )
        );
    }

    public Usuario registrarUsuario(Usuario usuario, PasswordEncoder passwordEncoder) {
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return usuarioRepository.save(usuario);
    }

    public boolean usuarioExiste(String nombre) {
        return usuarioRepository.findByNombre(nombre).isPresent();
    }
}

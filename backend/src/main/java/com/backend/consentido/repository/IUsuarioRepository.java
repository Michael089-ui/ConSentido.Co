package com.backend.consentido.repository;

import com.backend.consentido.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {
Optional<Usuario> findByNombre(String nombre);

}

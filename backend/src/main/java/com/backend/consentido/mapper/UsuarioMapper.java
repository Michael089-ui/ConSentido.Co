package com.backend.consentido.mapper;

import com.backend.consentido.dto.UsuarioRequestDTO;
import com.backend.consentido.dto.UsuarioResponseDTO;
import com.backend.consentido.model.Usuario;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setContrasena(dto.getContrasena());
        usuario.setEmail(dto.getEmail());
        usuario.setTipoDocumento(dto.getTipoDocumento());
        usuario.setNumeroDocumento(dto.getNumeroDocumento());
        usuario.setCelular(dto.getCelular());
        usuario.setEstado(dto.getEstado());
        usuario.setRol(Usuario.Rol.valueOf(dto.getRol())); // Usa .toUpperCase() si es necesario
        return usuario;
    }

    public static UsuarioResponseDTO toDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setTipoDocumento(usuario.getTipoDocumento());
        dto.setNumeroDocumento(usuario.getNumeroDocumento());
        dto.setCelular(usuario.getCelular());
        dto.setEstado(usuario.getEstado());
        dto.setRol(usuario.getRol().name());
        return dto;
    }
}

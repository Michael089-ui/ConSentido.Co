package com.backend.consentido.service;

import com.backend.consentido.model.Usuario;

import java.util.List;

public interface IUsuarioService {
    List<Usuario> obtenerTodos();
    Usuario obtenerPorId(Long id);
    void guardarUsuario(Usuario usuario);
    void eliminarUsuario(Long id);
    void editarUsuario(Long id, Usuario usuarioActualizado);
}

package com.backend.consentido.service;

import com.backend.consentido.model.Categoria;

import java.util.List;

public interface ICategoriaService {
    List<Categoria> obtenerTodas();
    Categoria obtenerPorId(Long id);
    void guardarCategoria(Categoria categoria);
    void eliminarCategoria(Long id);
    void editarCategoria(Long id, Categoria categoriaActualizada);
}

package com.backend.consentido.service;

import com.backend.consentido.model.Producto;

import java.util.List;

public interface IProductoService {
    List<Producto> obtenerTodos();
    Producto obtenerPorId(Long id);
    void guardarProducto(Producto producto);
    void eliminarProducto(Long id);
    void editarProducto(Long id, Producto productoActualizado);
}

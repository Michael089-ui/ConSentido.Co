package com.backend.consentido.service;

import com.backend.consentido.model.Inventario;
import com.backend.consentido.model.InventarioId;

import java.util.List;

public interface IInventarioService {
    List<Inventario> obtenerTodos();
    Inventario obtenerPorId(InventarioId id);
    void guardarInventario(Inventario inventario);
    void eliminarInventario(InventarioId id);
    void editarInventario(InventarioId id, Inventario inventarioActualizado);
}

package com.backend.consentido.service;

import com.backend.consentido.model.Inventario;
import com.backend.consentido.model.InventarioId;
import com.backend.consentido.repository.IInventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventarioService implements IInventarioService {

    private final IInventarioRepository inventarioRepository;

    @Autowired
    public InventarioService(IInventarioRepository inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    @Override
    public List<Inventario> obtenerTodos() {
        return inventarioRepository.findAll();
    }

    @Override
    public Inventario obtenerPorId(InventarioId id) {
        return inventarioRepository.findById(id).orElse(null);
    }

    @Override
    public void guardarInventario(Inventario inventario) {
        inventarioRepository.save(inventario);
    }

    @Override
    public void eliminarInventario(InventarioId id) {
        inventarioRepository.deleteById(id);
    }

    @Override
    public void editarInventario(InventarioId id, Inventario inventarioActualizado) {
        Inventario inventarioExistente = inventarioRepository.findById(id).orElse(null);
        if (inventarioExistente != null) {
            inventarioExistente.setEstado(inventarioActualizado.getEstado());
            inventarioExistente.setDescripcion(inventarioActualizado.getDescripcion());
            inventarioExistente.setCantidad(inventarioActualizado.getCantidad());
            inventarioExistente.setPrecio(inventarioActualizado.getPrecio());
            inventarioExistente.setCosto(inventarioActualizado.getCosto());
            inventarioRepository.save(inventarioExistente);
        } else {
            throw new RuntimeException("Inventario no encontrado con el id compuesto.");
        }
    }
}

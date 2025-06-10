package com.backend.consentido.controller;

import com.backend.consentido.model.Inventario;
import com.backend.consentido.model.InventarioId;
import com.backend.consentido.service.IInventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventario")
public class InventarioController {

    private final IInventarioService inventarioService;

    @Autowired
    public InventarioController(IInventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping
    public List<Inventario> obtenerTodos() {
        return inventarioService.obtenerTodos();
    }

    @GetMapping("/{idCategoria}/{idProducto}")
    public Inventario obtenerPorId(
            @PathVariable Long idCategoria,
            @PathVariable Long idProducto) {

        InventarioId id = new InventarioId(idCategoria, idProducto);
        return inventarioService.obtenerPorId(id);
    }

    @PostMapping
    public void guardarInventario(@RequestBody Inventario inventario) {
        inventarioService.guardarInventario(inventario);
    }

    @PutMapping("/{idCategoria}/{idProducto}")
    public void editarInventario(
            @PathVariable Long idCategoria,
            @PathVariable Long idProducto,
            @RequestBody Inventario actualizado) {

        InventarioId id = new InventarioId(idCategoria, idProducto);
        inventarioService.editarInventario(id, actualizado);
    }

    @DeleteMapping("/{idCategoria}/{idProducto}")
    public void eliminarInventario(
            @PathVariable Long idCategoria,
            @PathVariable Long idProducto) {

        InventarioId id = new InventarioId(idCategoria, idProducto);
        inventarioService.eliminarInventario(id);
    }
}

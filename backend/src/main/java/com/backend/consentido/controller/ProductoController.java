package com.backend.consentido.controller;

import com.backend.consentido.model.Producto;
import com.backend.consentido.service.IProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final IProductoService productoService;

    @Autowired
    public ProductoController(IProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public Producto obtenerPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id);
    }

    @PostMapping
    public void guardarProducto(@RequestBody Producto producto) {
        productoService.guardarProducto(producto);
    }

    @PutMapping("/{id}")
    public void editarProducto(@PathVariable Long id, @RequestBody Producto actualizado) {
        productoService.editarProducto(id, actualizado);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
    }
}

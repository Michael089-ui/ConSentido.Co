package com.backend.consentido.controller;

import com.backend.consentido.model.Categoria;
import com.backend.consentido.service.ICategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final ICategoriaService categoriaService;

    @Autowired
    public CategoriaController(ICategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<Categoria> obtenerTodos() {
        return categoriaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public Categoria obtenerPorId(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id);
    }

    @PostMapping
    public void guardarCategoria(@RequestBody Categoria categoria) {
        categoriaService.guardarCategoria(categoria);
    }

    @PutMapping("/{id}")
    public void editarCategoria(@PathVariable Long id, @RequestBody Categoria categoriaActualizada) {
        categoriaService.editarCategoria(id, categoriaActualizada);
    }

    @DeleteMapping("/{id}")
    public void eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
    }
}

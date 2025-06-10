package com.backend.consentido.controller;

import com.backend.consentido.model.Pedido;
import com.backend.consentido.service.IPedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final IPedidoService pedidoService;

    @Autowired
    public PedidoController(IPedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<Pedido> obtenerTodos() {
        return pedidoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public Pedido obtenerPorId(@PathVariable Long id) {
        return pedidoService.obtenerPorId(id);
    }

    @PostMapping
    public void guardarPedido(@RequestBody Pedido pedido) {
        pedidoService.guardarPedido(pedido);
    }

    @PutMapping("/{id}")
    public void editarPedido(@PathVariable Long id, @RequestBody Pedido pedidoActualizado) {
        pedidoService.editarPedido(id, pedidoActualizado);
    }

    @DeleteMapping("/{id}")
    public void eliminarPedido(@PathVariable Long id) {
        pedidoService.eliminarPedido(id);
    }
}

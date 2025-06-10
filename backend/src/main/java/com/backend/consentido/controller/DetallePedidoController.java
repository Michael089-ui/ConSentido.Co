package com.backend.consentido.controller;

import com.backend.consentido.model.DetallePedido;
import com.backend.consentido.model.DetallePedidoId;
import com.backend.consentido.service.IDetallePedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/detalles-pedido")
public class DetallePedidoController {

    private final IDetallePedidoService detallePedidoService;

    @Autowired
    public DetallePedidoController(IDetallePedidoService detallePedidoService) {
        this.detallePedidoService = detallePedidoService;
    }

    @GetMapping
    public List<DetallePedido> obtenerTodos() {
        return detallePedidoService.obtenerTodos();
    }

    @GetMapping("/{idPedido}/{idCategoria}/{idProducto}/{idDetalle}")
    public DetallePedido obtenerPorId(
            @PathVariable Long idPedido,
            @PathVariable Long idCategoria,
            @PathVariable Long idProducto,
            @PathVariable Long idDetalle) {

        DetallePedidoId id = new DetallePedidoId(idPedido, idCategoria, idProducto, idDetalle);
        return detallePedidoService.obtenerPorId(id);
    }

    @PostMapping
    public void guardarDetallePedido(@RequestBody DetallePedido detalle) {
        detallePedidoService.guardarDetalle(detalle);
    }

    @PutMapping("/{idPedido}/{idCategoria}/{idProducto}/{idDetalle}")
    public void editarDetallePedido(
            @PathVariable Long idPedido,
            @PathVariable Long idCategoria,
            @PathVariable Long idProducto,
            @PathVariable Long idDetalle,
            @RequestBody DetallePedido actualizado) {

        DetallePedidoId id = new DetallePedidoId(idPedido, idCategoria, idProducto, idDetalle);
        detallePedidoService.editarDetalle(id, actualizado);
    }

    @DeleteMapping("/{idPedido}/{idCategoria}/{idProducto}/{idDetalle}")
    public void eliminarDetallePedido(
            @PathVariable Long idPedido,
            @PathVariable Long idCategoria,
            @PathVariable Long idProducto,
            @PathVariable Long idDetalle) {

        DetallePedidoId id = new DetallePedidoId(idPedido, idCategoria, idProducto, idDetalle);
        detallePedidoService.eliminarDetalle(id);
    }
}

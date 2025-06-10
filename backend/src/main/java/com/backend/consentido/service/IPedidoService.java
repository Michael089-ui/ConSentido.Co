package com.backend.consentido.service;

import com.backend.consentido.model.Pedido;

import java.util.List;

public interface IPedidoService {
    List<Pedido> obtenerTodos();
    Pedido obtenerPorId(Long id);
    void guardarPedido(Pedido pedido);
    void eliminarPedido(Long id);
    void editarPedido(Long id, Pedido pedidoActualizado);
}

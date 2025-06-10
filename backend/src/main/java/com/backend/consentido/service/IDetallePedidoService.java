package com.backend.consentido.service;

import com.backend.consentido.model.DetallePedido;
import com.backend.consentido.model.DetallePedidoId;

import java.util.List;

public interface IDetallePedidoService {
    List<DetallePedido> obtenerTodos();
    DetallePedido obtenerPorId(DetallePedidoId id);
    void guardarDetalle(DetallePedido detallePedido);
    void eliminarDetalle(DetallePedidoId id);
    void editarDetalle(DetallePedidoId id, DetallePedido detalleActualizado);
}

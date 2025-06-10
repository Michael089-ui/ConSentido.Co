package com.backend.consentido.service;

import com.backend.consentido.model.DetallePedido;
import com.backend.consentido.model.DetallePedidoId;
import com.backend.consentido.repository.IDetallePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DetallePedidoService implements IDetallePedidoService {

    private final IDetallePedidoRepository detallePedidoRepository;

    @Autowired
    public DetallePedidoService(IDetallePedidoRepository detallePedidoRepository) {
        this.detallePedidoRepository = detallePedidoRepository;
    }

    @Override
    public List<DetallePedido> obtenerTodos() {
        return detallePedidoRepository.findAll();
    }

    @Override
    public DetallePedido obtenerPorId(DetallePedidoId id) {
        return detallePedidoRepository.findById(id).orElse(null);
    }

    @Override
    public void guardarDetalle(DetallePedido detallePedido) {
        detallePedidoRepository.save(detallePedido);
    }

    @Override
    public void eliminarDetalle(DetallePedidoId id) {
        detallePedidoRepository.deleteById(id);
    }

    @Override
    public void editarDetalle(DetallePedidoId id, DetallePedido detalleActualizado) {
        DetallePedido existente = detallePedidoRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setCantidad(detalleActualizado.getCantidad());
            existente.setPrecio(detalleActualizado.getPrecio());
            existente.setDescripcion(detalleActualizado.getDescripcion());
            detallePedidoRepository.save(existente);
        } else {
            throw new RuntimeException("DetallePedido no encontrado con el id compuesto");
        }
    }
}

package com.backend.consentido.service;

import com.backend.consentido.model.Pedido;
import com.backend.consentido.repository.IPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PedidoService implements IPedidoService {

    private final IPedidoRepository pedidoRepository;

    @Autowired
    public PedidoService(IPedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAll();
    }

    @Override
    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    @Override
    public void guardarPedido(Pedido pedido) {
        pedidoRepository.save(pedido);
    }

    @Override
    public void eliminarPedido(Long id) {
        pedidoRepository.deleteById(id);
    }

    @Override
    public void editarPedido(Long id, Pedido pedidoActualizado) {
        Pedido pedidoExistente = pedidoRepository.findById(id).orElse(null);
        if (pedidoExistente != null) {
            pedidoExistente.setEstado(pedidoActualizado.getEstado());
            pedidoExistente.setMetodoPago(pedidoActualizado.getMetodoPago());
            pedidoExistente.setEmail(pedidoActualizado.getEmail());
            pedidoExistente.setDireccion(pedidoActualizado.getDireccion());
            pedidoExistente.setUsuario(pedidoActualizado.getUsuario());
            pedidoRepository.save(pedidoExistente);
        } else {
            throw new RuntimeException("Pedido no encontrado con el id " + id);
        }
    }
}

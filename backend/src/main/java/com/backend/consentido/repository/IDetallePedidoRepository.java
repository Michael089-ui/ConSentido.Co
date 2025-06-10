package com.backend.consentido.repository;

import com.backend.consentido.model.DetallePedido;
import com.backend.consentido.model.DetallePedidoId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IDetallePedidoRepository extends JpaRepository<DetallePedido, DetallePedidoId> {
}

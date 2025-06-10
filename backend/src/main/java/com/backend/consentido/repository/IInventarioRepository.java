package com.backend.consentido.repository;

import com.backend.consentido.model.Inventario;
import com.backend.consentido.model.InventarioId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IInventarioRepository extends JpaRepository<Inventario, InventarioId> {
}

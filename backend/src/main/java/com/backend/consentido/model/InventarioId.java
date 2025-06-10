package com.backend.consentido.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class InventarioId implements Serializable {

    private Integer idCategoria;
    private Integer idProducto;

    public InventarioId(Long idCategoria, Long idProducto) {}

    public InventarioId(Integer idCategoria, Integer idProducto) {
        this.idCategoria = idCategoria;
        this.idProducto = idProducto;
    }

    public Integer getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Integer idCategoria) {
        this.idCategoria = idCategoria;
    }

    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof InventarioId)) return false;
        InventarioId that = (InventarioId) o;
        return Objects.equals(idCategoria, that.idCategoria) &&
                Objects.equals(idProducto, that.idProducto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCategoria, idProducto);
    }
}

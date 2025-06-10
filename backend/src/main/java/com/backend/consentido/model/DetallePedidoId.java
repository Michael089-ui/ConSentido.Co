package com.backend.consentido.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DetallePedidoId implements Serializable {

    private Integer idPedido;
    private Integer idCategoria;
    private Integer idProducto;
    private Integer idDetallePedido;

    public DetallePedidoId(Long idPedido, Long idCategoria, Long idProducto, Long idDetalle) {}

    public DetallePedidoId(Integer idPedido, Integer idCategoria, Integer idProducto, Integer idDetallePedido) {
        this.idPedido = idPedido;
        this.idCategoria = idCategoria;
        this.idProducto = idProducto;
        this.idDetallePedido = idDetallePedido;
    }

    // Getters y Setters

    public Integer getIdPedido() { return idPedido; }
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }

    public Integer getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Integer idCategoria) { this.idCategoria = idCategoria; }

    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

    public Integer getIdDetallePedido() { return idDetallePedido; }
    public void setIdDetallePedido(Integer idDetallePedido) { this.idDetallePedido = idDetallePedido; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DetallePedidoId)) return false;
        DetallePedidoId that = (DetallePedidoId) o;
        return Objects.equals(idPedido, that.idPedido) &&
                Objects.equals(idCategoria, that.idCategoria) &&
                Objects.equals(idProducto, that.idProducto) &&
                Objects.equals(idDetallePedido, that.idDetallePedido);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPedido, idCategoria, idProducto, idDetallePedido);
    }
}

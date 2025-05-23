export class ProductosManager {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.categorias = ['madera', 'papel', 'tejidos'];
    }

    init() {
        this.loadTemplates();
        this.initEventListeners();
        this.cargarProductos();
    }

    agregarProducto(producto) {
        producto.id = Date.now();
        this.productos.push(producto);
        this.guardarProductos();
        return producto;
    }

    obtenerProductos(categoria = null) {
        if (categoria) {
            return this.productos.filter(p => p.categoria === categoria);
        }
        return this.productos;
    }

    actualizarProducto(id, datosActualizados) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos[index] = { ...this.productos[index], ...datosActualizados };
            this.guardarProductos();
            return true;
        }
        return false;
    }

    eliminarProducto(id) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos.splice(index, 1);
            this.guardarProductos();
            return true;
        }
        return false;
    }

    guardarProductos() {
        localStorage.setItem('productos', JSON.stringify(this.productos));
    }

    obtenerPorCategoria(categoria) {
        return this.productos.filter(p => p.categoria === categoria);
    }
}
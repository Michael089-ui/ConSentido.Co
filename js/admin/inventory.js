export class InventoryManager {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.categorias = ['madera', 'papel', 'tejidos'];
        this.templates = {};
    }

    init() {
        this.cargarProductos();
        this.initEventListeners();
    }

    cargarProductos() {
        const tablaProductos = document.getElementById('tablaProductos');
        if (!tablaProductos) return;

        tablaProductos.innerHTML = this.productos.map(producto => this.crearFilaProducto(producto)).join('');
    }

    crearFilaProducto(producto) {
        const estado = this.determinarEstadoStock(producto.stock);
        return `
            <tr>
                <td>
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-thumb">
                    ${producto.nombre}
                </td>
                <td>${producto.categoria}</td>
                <td>${producto.stock}</td>
                <td>$${producto.precio.toLocaleString()}</td>
                <td><span class="badge bg-${estado}">${producto.estado}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info view-btn" data-id="${producto.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${producto.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${producto.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    initEventListeners() {
        // Event listeners para los botones de acción
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.verProducto(btn.dataset.id));
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editarProducto(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.eliminarProducto(btn.dataset.id));
        });
    }

    determinarEstadoStock(cantidad) {
        if (cantidad <= 5) return 'danger';
        if (cantidad <= 15) return 'warning';
        return 'success';
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
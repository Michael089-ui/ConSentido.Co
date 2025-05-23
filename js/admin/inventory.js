import { DataService } from '../services/data-services.js';

export class InventoryManager {
    constructor() {
        this.dataService = new DataService();
    }

    async init() {
        await this.cargarProductos();
        this.setupEventListeners();
    }

    async cargarProductos() {
        try {
            const productos = await this.dataService.getAllProducts();
            this.renderProductos(productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.mostrarMensaje('Error al cargar productos', 'danger');
        }
    }

    setupEventListeners() {
        // Formulario para agregar producto
        const formAgregar = document.getElementById('agregarProductoForm');
        if (formAgregar) {
            formAgregar.addEventListener('submit', (e) => this.handleAgregarProducto(e));
        }

        // Previsualización de imagen
        const inputImagen = document.getElementById('productoImagen');
        if (inputImagen) {
            inputImagen.addEventListener('change', this.previsualizarImagen);
        }

        // Filtros
        const buscarInput = document.getElementById('buscarProducto');
        const categoriaSelect = document.getElementById('filtroCategoria');
        const stockSelect = document.getElementById('filtroStock');

        if (buscarInput) buscarInput.addEventListener('input', () => this.aplicarFiltros());
        if (categoriaSelect) categoriaSelect.addEventListener('change', () => this.aplicarFiltros());
        if (stockSelect) stockSelect.addEventListener('change', () => this.aplicarFiltros());
    }

    async handleAgregarProducto(e) {
        e.preventDefault();

        try {
            const producto = await this.createProductFromForm(e.target);
            this.dataService.addProduct(producto);
            this.productos = this.dataService.getAllProducts();
            this.cargarProductos();

            this.closeModal();
            this.mostrarMensaje('Producto agregado exitosamente', 'success');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarMensaje('Error al agregar el producto', 'danger');
        }
    }

    createProductFromForm(form) {
        return new Promise((resolve, reject) => {
            const formData = new FormData(form);
            const fileInput = document.getElementById('productoImagen');
            const file = fileInput.files[0];

            this.convertImageToBase64(file)
                .then(base64Image => {
                    const producto = {
                        id: Date.now(),
                        nombre: formData.get('productoNombre'),
                        categoria: formData.get('productoCategoria'),
                        stock: parseInt(formData.get('productoStock')),
                        descripcion: formData.get('productoDescripcion'),
                        precio: parseFloat(formData.get('productoPrecio')),
                        imagen: base64Image,
                        estado: 'activo'
                    };
                    resolve(producto);
                })
                .catch(error => reject(error));
        });
    }

    convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    renderProductos(productos) {
        const tablaProductos = document.getElementById('tablaProductos');
        if (!tablaProductos) return;

        tablaProductos.innerHTML = productos.map(producto => this.crearFilaProducto(producto)).join('');

        // Reinicializar los event listeners de los botones
        this.initBotonesAcciones();
    }

    aplicarFiltros() {
        let productosFiltrados = [...this.productos];

        const busqueda = document.getElementById('buscarProducto')?.value.toLowerCase();
        const categoria = document.getElementById('filtroCategoria')?.value;
        const estadoStock = document.getElementById('filtroStock')?.value;

        if (busqueda) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.nombre.toLowerCase().includes(busqueda) ||
                p.descripcion.toLowerCase().includes(busqueda)
            );
        }

        if (categoria) {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
        }

        if (estadoStock) {
            productosFiltrados = productosFiltrados.filter(p => {
                switch (estadoStock) {
                    case 'bajo': return p.stock <= 5;
                    case 'normal': return p.stock > 5 && p.stock <= 15;
                    case 'alto': return p.stock > 15;
                    default: return true;
                }
            });
        }

        return productosFiltrados;
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

    initBotonesAcciones() {
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

    mostrarMensaje(mensaje, tipo) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('.content');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}
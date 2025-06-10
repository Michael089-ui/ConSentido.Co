// Importación del servicio para manejo de productos desde la ruta correcta
import { ProductServices } from '../services/admin/manage_product_services.js';

export class InventoryManager {
    // Constructor que inicializa la instancia del servicio y el arreglo de productos
    constructor() {
        // Instanciamos el servicio específico para productos del panel de administración
        this.dataService = new ProductServices();
        this.productos = [];
    }

    // Inicializa la carga de productos y configuración de eventos
    async init() {
        await this.cargarProductos();
        this.setupEventListeners();
    }

    // Carga productos desde backend y los renderiza
    async cargarProductos() {
        try {
            // Obtenemos todos los productos desde la API
            const productos = await this.dataService.getAllProducts();
            this.productos = productos;
            this.renderProductos(productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.mostrarMensaje('Error al cargar productos', 'danger');
        }
    }

    // Configura los event listeners para formularios, filtros e inputs
    setupEventListeners() {
        const formAgregar = document.getElementById('agregarProductoForm');
        if (formAgregar) {
            formAgregar.addEventListener('submit', (e) => this.handleAgregarProducto(e));
        }

        const inputImagen = document.getElementById('productoImagen');
        if (inputImagen) {
            inputImagen.addEventListener('change', (e) => {
                const preview = document.getElementById('vistaPrevia');
                this.previsualizarImagen(e, preview);
            });
        }

        const buscarInput = document.getElementById('buscarProducto');
        const categoriaSelect = document.getElementById('filtroCategoria');
        const stockSelect = document.getElementById('filtroStock');

        if (buscarInput) buscarInput.addEventListener('input', () => this.aplicarFiltros());
        if (categoriaSelect) categoriaSelect.addEventListener('change', () => this.aplicarFiltros());
        if (stockSelect) stockSelect.addEventListener('change', () => this.aplicarFiltros());

        const formEditar = document.getElementById('editarProductoForm');
        if (formEditar) {
            formEditar.addEventListener('submit', (e) => this.handleEditarProducto(e));
        }

        const inputImagenEditar = document.getElementById('editarImagen');
        if (inputImagenEditar) {
            inputImagenEditar.addEventListener('change', (e) => {
                const preview = document.getElementById('editarVistaPrevia');
                this.previsualizarImagen(e, preview);
            });
        }
    }

    // Maneja el envío del formulario para agregar un producto
    async handleAgregarProducto(e) {
        e.preventDefault();

        try {
            const formData = new FormData(e.target);
            const fileInput = document.getElementById('productoImagen');
            const file = fileInput.files[0];

            // Convertir imagen a base64 para enviar al backend
            const base64Image = file ? await this.convertImageToBase64(file) : null;

            // Construir objeto producto con datos del formulario y la imagen en base64
            const producto = {
                nombre: formData.get('productoNombre'),
                categoria: formData.get('productoCategoria'),
                stock: parseInt(formData.get('productoStock')),
                descripcion: formData.get('productoDescripcion'),
                precio: parseFloat(formData.get('productoPrecio')),
                imagenBase64: base64Image, // Enviar base64 para que backend la procese
                estado: 'activo'
            };

            // Crear producto en backend a través del servicio
            await this.dataService.createProduct(producto);
            await this.cargarProductos();

            // Cerrar modal y resetear formulario
            const modal = document.getElementById('agregarProductoModal');
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();

            e.target.reset();

            this.mostrarMensaje('Producto agregado exitosamente', 'success');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarMensaje('Error al agregar el producto', 'danger');
        }
    }

    // Convierte un archivo de imagen a base64 para previsualización y envío
    convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Renderiza la tabla de productos en el DOM
    renderProductos(productos) {
        const tablaProductos = document.getElementById('tablaProductos');
        if (!tablaProductos) return;

        tablaProductos.innerHTML = productos.map(producto => this.crearFilaProducto(producto)).join('');

        // Inicializar eventos para botones de acción
        this.initBotonesAcciones();
    }

    // Aplica filtros de búsqueda, categoría y stock sobre los productos
    aplicarFiltros() {
        try {
            if (!Array.isArray(this.productos)) {
                console.error('No hay productos para filtrar');
                return;
            }

            let productosFiltrados = [...this.productos];

            const busqueda = document.getElementById('buscarProducto')?.value.toLowerCase();
            const categoria = document.getElementById('filtroCategoria')?.value;
            const estadoStock = document.getElementById('filtroStock')?.value;

            if (busqueda) {
                productosFiltrados = productosFiltrados.filter(p =>
                    p.nombre?.toLowerCase().includes(busqueda) ||
                    p.descripcion?.toLowerCase().includes(busqueda)
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

            this.renderProductos(productosFiltrados);
        } catch (error) {
            console.error('Error al aplicar filtros:', error);
            this.mostrarMensaje('Error al filtrar productos', 'danger');
        }
    }

    // Crea el HTML para una fila de producto en la tabla
    crearFilaProducto(producto) {
        // Usar la URL o ruta que venga del backend para la imagen
        const imageSrc = producto.imagen || '/assets/images/default-product.png';

        return `
            <tr>
                <td class="producto-nombre">
                    <img src="${imageSrc}" alt="${producto.nombre}" class="producto-thumb">
                    ${producto.nombre}
                </td>
                <td>${producto.categoria || ''}</td>
                <td>${producto.stock || 0}</td>
                <td>$${(producto.precio || 0).toLocaleString()}</td>
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

    // Inicializa los event listeners para los botones de acción en cada fila
    initBotonesAcciones() {
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

    // Muestra el modal con los detalles de un producto
    async verProducto(id) {
        try {
            // Obtener el producto directamente desde el array local en memoria
            const producto = this.productos.find(p => p.id === id);
            if (!producto) return;

            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${producto.imagen || '/assets/images/default-product.png'}" class="img-fluid" alt="${producto.nombre}">
                    </div>
                    <div class="col-md-6">
                        <h4>${producto.nombre}</h4>
                        <p><strong>Categoría:</strong> ${producto.categoria}</p>
                        <p><strong>Stock:</strong> ${producto.stock}</p>
                        <p><strong>Precio:</strong> $${producto.precio.toLocaleString()}</p>
                        <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                    </div>
                </div>
            `;

            document.getElementById('verProductoModalBody').innerHTML = modalContent;
            const modal = new bootstrap.Modal(document.getElementById('verProductoModal'));
            modal.show();
        } catch (error) {
            console.error('Error al ver producto:', error);
            this.mostrarMensaje('Error al cargar el producto', 'danger');
        }
    }

    // Muestra el modal para editar un producto y llena el formulario con los datos actuales
    async editarProducto(id) {
        try {
            const producto = this.productos.find(p => p.id === id);
            if (!producto) return;

            const form = document.getElementById('editarProductoForm');
            form.querySelector('#editarId').value = producto.id;
            form.querySelector('#editarNombre').value = producto.nombre;
            form.querySelector('#editarCategoria').value = producto.categoria;
            form.querySelector('#editarStock').value = producto.stock;
            form.querySelector('#editarPrecio').value = producto.precio;
            form.querySelector('#editarDescripcion').value = producto.descripcion;

            const preview = form.querySelector('#editarVistaPrevia');
            if (preview) {
                preview.src = producto.imagen || '/assets/images/default-product.png';
                preview.classList.remove('d-none');
            }

            const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
            modal.show();
        } catch (error) {
            console.error('Error al editar producto:', error);
            this.mostrarMensaje('Error al cargar el producto', 'danger');
        }
    }

    // Elimina un producto tras confirmación del usuario
    async eliminarProducto(id) {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            try {
                // Eliminar el producto a través del servicio
                await this.dataService.deleteProduct(id);
                // Actualizar la lista de productos
                await this.cargarProductos();
                this.mostrarMensaje('Producto eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                this.mostrarMensaje('Error al eliminar el producto', 'danger');
            }
        }
    }

    // Maneja el envío del formulario para editar un producto
    async handleEditarProducto(e) {
        e.preventDefault();
        try {
            const id = document.getElementById('editarId').value;
            const fileInput = document.getElementById('editarImagen');
            let base64Image = null;

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                base64Image = await this.convertImageToBase64(file);
            }

            const productoActualizado = {
                nombre: document.getElementById('editarNombre').value,
                categoria: document.getElementById('editarCategoria').value,
                stock: parseInt(document.getElementById('editarStock').value),
                descripcion: document.getElementById('editarDescripcion').value,
                precio: parseFloat(document.getElementById('editarPrecio').value),
                // Solo enviar imagen si se seleccionó una nueva
                ...(base64Image && { imagenBase64: base64Image }),
                estado: 'activo'
            };

            // Actualizar el producto a través del servicio
            await this.dataService.updateProduct(id, productoActualizado);
            await this.cargarProductos();

            const modal = bootstrap.Modal.getInstance(document.getElementById('editarProductoModal'));
            modal.hide();

            this.mostrarMensaje('Producto actualizado exitosamente', 'success');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            this.mostrarMensaje('Error al actualizar el producto', 'danger');
        }
    }

    // Muestra mensajes de alerta en la interfaz
    mostrarMensaje(mensaje, tipo) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;

        const container = document.querySelector('.content');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    // Previsualiza la imagen seleccionada en un input file
    previsualizarImagen(e, preview) {
        const file = e.target.files[0];
        if (preview && file) {
            preview.classList.remove('d-none');
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
}

// Inicializar cuando se carga el DOM si se usa como módulo independiente
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si no es cargado por AdminManager
    if (!window.adminManager) {
        window.inventoryManager = new InventoryManager();
        window.inventoryManager.init();
    }
});
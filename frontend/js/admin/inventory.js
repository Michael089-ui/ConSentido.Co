import { DataService } from '../services/data-services.js';
import { UIService } from '../services/ui-service.js';

/**
 * Clase para gestionar el inventario en el panel de administración
 * @class InventoryManager
 */
export class InventoryManager {
    /**
     * Constructor de la clase InventoryManager
     * Inicializa los servicios necesarios
     */
    constructor() {
        this.dataService = new DataService();
        this.uiService = new UIService();
        this.productos = [];
    }

    /**
     * Inicializa el gestor de inventario
     * @async
     */
    async init() {
        try {
            await this.cargarProductos();
            this.setupEventListeners();
            console.log('Gestor de inventario inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar gestor de inventario:', error);
            this.mostrarMensaje('Error al inicializar. Verifica la conexión con el servidor', 'danger');
        }
    }

    /**
     * Carga los productos desde el backend
     * @async
     */
    async cargarProductos() {
        try {
            const productos = await this.dataService.getAllProducts();
            // Verificar que la respuesta sea un array
            this.productos = Array.isArray(productos) ? productos : [];
            this.renderProductos(this.productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.mostrarMensaje('Error al cargar productos. Verifica la conexión con el servidor', 'danger');
            this.productos = [];
            this.renderProductos([]);
        }
    }

    /**
     * Configura los oyentes de eventos para los elementos de la interfaz
     */
    setupEventListeners() {
        // Formulario para agregar producto
        const formAgregar = document.getElementById('agregarProductoForm');
        if (formAgregar) {
            formAgregar.addEventListener('submit', (e) => this.handleAgregarProducto(e));
        }

        // Previsualización de imagen
        const inputImagen = document.getElementById('productoImagen');
        if (inputImagen) {
            inputImagen.addEventListener('change', (e) => {
                const preview = document.getElementById('productoImagenPreview');
                this.previsualizarImagen(e, preview);
            });
        }

        // Filtros
        const buscarInput = document.getElementById('buscarProducto');
        const categoriaSelect = document.getElementById('filtroCategoria');
        const stockSelect = document.getElementById('filtroStock');

        if (buscarInput) buscarInput.addEventListener('input', () => this.aplicarFiltros());
        if (categoriaSelect) categoriaSelect.addEventListener('change', () => this.aplicarFiltros());
        if (stockSelect) stockSelect.addEventListener('change', () => this.aplicarFiltros());

        // Formulario para editar producto
        const formEditar = document.getElementById('editarProductoForm');
        if (formEditar) {
            formEditar.addEventListener('submit', (e) => this.handleEditarProducto(e));
        }

        // Previsualización de imagen en edición
        const inputImagenEditar = document.getElementById('editarImagen');
        if (inputImagenEditar) {
            inputImagenEditar.addEventListener('change', (e) => {
                const preview = document.getElementById('editarVistaPrevia');
                this.previsualizarImagen(e, preview);
            });
        }
    }

    /**
     * Maneja la adición de un nuevo producto
     * @async
     * @param {Event} e - Evento del formulario
     */
    async handleAgregarProducto(e) {
        e.preventDefault();

        try {
            // Mostrar indicador de carga
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...`;
            }

            const formData = new FormData(e.target);
            const fileInput = document.getElementById('productoImagen');
            
            // Crear objeto de producto con los datos del formulario
            const producto = {
                nombre: formData.get('productoNombre'),
                categoria: formData.get('productoCategoria'),
                stock: parseInt(formData.get('productoStock'), 10) || 0,
                descripcion: formData.get('productoDescripcion'),
                precio: parseFloat(formData.get('productoPrecio')) || 0,
                estado: 'activo'
            };

            // Manejar la imagen si está presente
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                
                // Para Spring Boot, en un entorno real deberíamos usar FormData
                // Pero para simular, guardamos la imagen temporalmente en base64
                const base64Image = await this.convertImageToBase64(file);
                
                // En una aplicación real, aquí enviaríamos la imagen al servidor
                // y obtendríamos la URL resultante
                const uniquePrefix = new Date().toISOString().replace(/[-:.]/g, '');
                const safeFileName = uniquePrefix + '_' + file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                const imagePath = `/assets/images/products/${safeFileName}`;
                
                // Almacenamiento temporal - en producción esto se manejaría en el servidor
                const images = JSON.parse(localStorage.getItem('productImages') || '{}');
                images[imagePath] = base64Image;
                localStorage.setItem('productImages', JSON.stringify(images));
                
                producto.imagen = imagePath;
            } else {
                producto.imagen = '/assets/images/placeholder.png';
            }

            // Enviar al backend
            await this.dataService.addProduct(producto);
            
            // Recargar productos desde el backend
            await this.cargarProductos();

            // Cerrar modal y reset formulario
            const modal = document.getElementById('agregarProductoModal');
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            e.target.reset();

            // Mensaje de éxito
            this.mostrarMensaje('Producto agregado exitosamente', 'success');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarMensaje('Error al agregar el producto: ' + (error.message || 'Error en el servidor'), 'danger');
        } finally {
            // Restaurar botón
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Guardar';
            }
        }
    }

    /**
     * Convierte una imagen a base64
     * @param {File} file - Archivo de imagen
     * @returns {Promise<string>} - Imagen en formato base64
     */
    convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Renderiza los productos en la tabla
     * @param {Array} productos - Lista de productos
     */
    renderProductos(productos) {
        const tablaProductos = document.getElementById('tablaProductos');
        if (!tablaProductos) return;

        if (!productos || productos.length === 0) {
            tablaProductos.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <p class="text-muted py-3">No hay productos disponibles</p>
                    </td>
                </tr>
            `;
            return;
        }

        tablaProductos.innerHTML = productos.map(producto => this.crearFilaProducto(producto)).join('');

        // Reinicializar los event listeners de los botones
        this.initBotonesAcciones();
    }

    /**
     * Aplica los filtros seleccionados a la lista de productos
     */
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
                productosFiltrados = productosFiltrados.filter(p => {
                    // Manejar tanto objetos de categoría como strings
                    if (typeof p.categoria === 'object' && p.categoria !== null) {
                        return p.categoria.id == categoria || 
                               p.categoria.nombre?.toLowerCase() === categoria.toLowerCase();
                    }
                    return p.categoria === categoria || p.categoriaId == categoria;
                });
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

    /**
     * Crea una fila HTML para un producto
     * @param {Object} producto - Objeto producto
     * @returns {string} - HTML de la fila
     */
    crearFilaProducto(producto) {
        // Manejar casos en los que la imagen esté en localStorage (temporal)
        const images = JSON.parse(localStorage.getItem('productImages') || '{}');
        const imageSrc = images[producto.imagen] || producto.imagen || '/assets/images/placeholder.png';
        
        // Usar idProducto o id, dependiendo del formato del backend
        const productId = producto.idProducto || producto.id;

        const stockClass = this.determinarEstadoStock(producto.stock);

        return `
            <tr>
                <td class="producto-nombre">
                    <img src="${imageSrc}" alt="${producto.nombre}" class="producto-thumb">
                    ${producto.nombre || 'Sin nombre'}
                </td>
                <td>${this.formatearCategoria(producto.categoria) || 'Sin categoría'}</td>
                <td><span class="badge bg-${stockClass}">${producto.stock || 0}</span></td>
                <td>$${(producto.precio || 0).toLocaleString()}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info view-btn" data-id="${productId}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${productId}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${productId}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Formatea el objeto o string de categoría para mostrar
     * @param {Object|string} categoria - Categoría del producto
     * @returns {string} - Nombre de la categoría formateado
     */
    formatearCategoria(categoria) {
        if (!categoria) return '';
        if (typeof categoria === 'string') return categoria;
        if (typeof categoria === 'object' && categoria !== null) {
            return categoria.nombre || '';
        }
        return '';
    }

    /**
     * Inicializa los botones de acción en la tabla
     */
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

    /**
     * Determina la clase CSS para el estado del stock
     * @param {number} cantidad - Cantidad en stock
     * @returns {string} - Clase CSS
     */
    determinarEstadoStock(cantidad) {
        if (cantidad <= 5) return 'danger';
        if (cantidad <= 15) return 'warning';
        return 'success';
    }

    /**
     * Maneja la edición de un producto
     * @async
     * @param {Event} e - Evento del formulario
     */
    async handleEditarProducto(e) {
        e.preventDefault();
        try {
            // Mostrar indicador de carga
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando...`;
            }
            
            const id = document.getElementById('editarId').value;
            const fileInput = document.getElementById('editarImagen');
            let imagePath = document.getElementById('editarVistaPrevia').src;

            // Si la imagen viene del servidor y no del localStorage
            if (imagePath.startsWith('http') || imagePath.startsWith('/assets/')) {
                // Mantenemos la ruta actual
            } else {
                // Para imágenes de la previsualización, necesitamos convertirla
                imagePath = '/assets/images/placeholder.png';
            }

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const base64Image = await this.convertImageToBase64(file);
                const uniquePrefix = new Date().toISOString().replace(/[-:.]/g, '');
                const safeFileName = uniquePrefix + '_' + file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                imagePath = `/assets/images/products/${safeFileName}`;

                // Guardar nueva imagen en localStorage (temporal)
                const images = JSON.parse(localStorage.getItem('productImages') || '{}');
                images[imagePath] = base64Image;
                localStorage.setItem('productImages', JSON.stringify(images));
            }

            const productoActualizado = {
                nombre: document.getElementById('editarNombre').value,
                categoria: document.getElementById('editarCategoria').value,
                stock: parseInt(document.getElementById('editarStock').value, 10) || 0,
                descripcion: document.getElementById('editarDescripcion').value,
                precio: parseFloat(document.getElementById('editarPrecio').value) || 0,
                imagen: imagePath,
                estado: 'activo'
            };

            // Usar idProducto o id según lo que espera el backend
            await this.dataService.updateProduct(id, productoActualizado);
            await this.cargarProductos();

            const modal = bootstrap.Modal.getInstance(document.getElementById('editarProductoModal'));
            if (modal) modal.hide();
            
            this.mostrarMensaje('Producto actualizado exitosamente', 'success');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            this.mostrarMensaje('Error al actualizar el producto: ' + (error.message || 'Error en el servidor'), 'danger');
        } finally {
            // Restaurar botón
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Guardar cambios';
            }
        }
    }

    /**
     * Muestra un mensaje en la interfaz
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo de mensaje (success, danger, etc.)
     */
    mostrarMensaje(mensaje, tipo) {
        if (this.uiService) {
            this.uiService.showMessage(mensaje, tipo);
            return;
        }

        // Fallback si no existe UIService
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('.content');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }

    /**
     * Previsualiza una imagen antes de subirla
     * @param {Event} e - Evento del input file
     * @param {HTMLElement} preview - Elemento para mostrar la previsualización
     */
    previsualizarImagen(e, preview) {
        const file = e.target.files[0];
        if (!preview || !file) return;
        
        if (!file.type.startsWith('image/')) {
            this.mostrarMensaje('El archivo debe ser una imagen (jpg, png, gif)', 'warning');
            return;
        }

        preview.classList.remove('d-none');
        const reader = new FileReader();
        reader.onload = (event) => {
            preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Muestra los detalles de un producto
     * @async
     * @param {string|number} id - ID del producto
     */
    async verProducto(id) {
        try {
            // Buscar en la cache local primero
            let producto = this.productos.find(p => (p.idProducto || p.id) == id);
            
            // Si no está en cache, intentar obtenerlo del servidor
            if (!producto) {
                producto = await this.dataService.getProductById(id);
                if (!producto) throw new Error('Producto no encontrado');
            }

            const images = JSON.parse(localStorage.getItem('productImages') || '{}');
            const imageSrc = images[producto.imagen] || producto.imagen || '/assets/images/placeholder.png';

            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${imageSrc}" class="img-fluid" alt="${producto.nombre || 'Producto'}">
                    </div>
                    <div class="col-md-6">
                        <h4>${producto.nombre || 'Sin nombre'}</h4>
                        <p><strong>Categoría:</strong> ${this.formatearCategoria(producto.categoria) || 'Sin categoría'}</p>
                        <p><strong>Stock:</strong> 
                            <span class="badge bg-${this.determinarEstadoStock(producto.stock)}">${producto.stock || 0}</span>
                        </p>
                        <p><strong>Precio:</strong> $${(producto.precio || 0).toLocaleString()}</p>
                        <p><strong>Descripción:</strong> ${producto.descripcion || 'Sin descripción'}</p>
                    </div>
                </div>
            `;

            const modalBody = document.getElementById('verProductoModalBody');
            if (!modalBody) throw new Error('Modal no encontrado en el DOM');
            
            modalBody.innerHTML = modalContent;
            const modal = new bootstrap.Modal(document.getElementById('verProductoModal'));
            modal.show();
        } catch (error) {
            console.error('Error al ver producto:', error);
            this.mostrarMensaje('Error al cargar el producto: ' + (error.message || ''), 'danger');
        }
    }

    /**
     * Carga un producto en el formulario de edición
     * @async
     * @param {string|number} id - ID del producto
     */
    async editarProducto(id) {
        try {
            // Buscar en la cache local primero
            let producto = this.productos.find(p => (p.idProducto || p.id) == id);
            
            // Si no está en cache, intentar obtenerlo del servidor
            if (!producto) {
                producto = await this.dataService.getProductById(id);
                if (!producto) throw new Error('Producto no encontrado');
            }

            // Llenar el formulario de edición
            const form = document.getElementById('editarProductoForm');
            if (!form) throw new Error('Formulario no encontrado');
            
            form.querySelector('#editarId').value = producto.idProducto || producto.id;
            form.querySelector('#editarNombre').value = producto.nombre || '';
            form.querySelector('#editarCategoria').value = 
                typeof producto.categoria === 'object' && producto.categoria !== null ? 
                producto.categoria.id || producto.categoria.nombre || '' : 
                producto.categoria || '';
            form.querySelector('#editarStock').value = producto.stock || 0;
            form.querySelector('#editarPrecio').value = producto.precio || 0;
            form.querySelector('#editarDescripcion').value = producto.descripcion || '';

            // Mostrar la imagen actual
            const images = JSON.parse(localStorage.getItem('productImages') || '{}');
            const imageSrc = images[producto.imagen] || producto.imagen || '/assets/images/placeholder.png';
            const preview = form.querySelector('#editarVistaPrevia');
            if (preview) {
                preview.src = imageSrc;
                preview.classList.remove('d-none');
            }

            const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
            modal.show();
        } catch (error) {
            console.error('Error al editar producto:', error);
            this.mostrarMensaje('Error al cargar el producto: ' + (error.message || ''), 'danger');
        }
    }

    /**
     * Elimina un producto
     * @async
     * @param {string|number} id - ID del producto
     */
    async eliminarProducto(id) {
        if (confirm('¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
            try {
                // Mostrar indicador de carga
                const loadingElement = document.createElement('div');
                loadingElement.className = 'position-fixed top-50 start-50 translate-middle bg-white p-3 rounded shadow';
                loadingElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="spinner-border text-primary me-3" role="status">
                            <span class="visually-hidden">Eliminando...</span>
                        </div>
                        <span>Eliminando producto...</span>
                    </div>
                `;
                document.body.appendChild(loadingElement);
                
                await this.dataService.deleteProduct(id);
                await this.cargarProductos();
                
                this.mostrarMensaje('Producto eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                this.mostrarMensaje('Error al eliminar el producto: ' + (error.message || 'Error en el servidor'), 'danger');
            } finally {
                // Eliminar indicador de carga
                const loadingElement = document.querySelector('.position-fixed.top-50.start-50');
                if (loadingElement) loadingElement.remove();
            }
        }
    }
}

// No exponer la instancia globalmente para evitar problemas de seguridad
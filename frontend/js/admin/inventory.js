
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
            this.productos = productos; // Guardar los productos en la instancia
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
            inputImagen.addEventListener('change', (e) => this.previsualizarImagen(e));
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

    async handleAgregarProducto(e) {
        e.preventDefault();

        try {
            const formData = new FormData(e.target);
            const fileInput = document.getElementById('productoImagen');
            const file = fileInput.files[0];

            // Convertir imagen a base64 y guardar en localStorage
            const base64Image = await this.convertImageToBase64(file);
            const uniquePrefix = Date.now() + '-';
            const safeFileName = uniquePrefix + file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            const imagePath = `/assets/images/products/${safeFileName}`;

            // Guardar imagen en localStorage
            const images = JSON.parse(localStorage.getItem('productImages') || '{}');
            images[imagePath] = base64Image;
            localStorage.setItem('productImages', JSON.stringify(images));


            //Cuando se maneje backend aquí se debe utilizar para mover el archvio por ahora no hace falta

            const producto = {
                nombre: formData.get('productoNombre'),
                categoria: formData.get('productoCategoria'),
                stock: parseInt(formData.get('productoStock')),
                descripcion: formData.get('productoDescripcion'),
                precio: parseFloat(formData.get('productoPrecio')),
                imagen: imagePath,
                estado: 'activo'
            };

            await this.dataService.addProduct(producto);
            await this.cargarProductos();

            // Close modal using Bootstrap
            const modal = document.getElementById('agregarProductoModal');
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }

            // Reset form
            e.target.reset();

            this.mostrarMensaje('Producto agregado exitosamente', 'success');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarMensaje('Error al agregar el producto', 'danger');
        }
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

    crearFilaProducto(producto) {
        const images = JSON.parse(localStorage.getItem('productImages') || '{}');
        const imageSrc = images[producto.imagen] || producto.imagen;

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

    async handleEditarProducto(e) {
        e.preventDefault();
        try {
            const id = document.getElementById('editarId').value;
            const fileInput = document.getElementById('editarImagen');
            let imagePath = document.getElementById('editarVistaPrevia').src;

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const base64Image = await this.convertImageToBase64(file);
                const uniquePrefix = Date.now() + '-';
                const safeFileName = uniquePrefix + file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                imagePath = `/assets/images/products/${safeFileName}`;

                // Guardar nueva imagen en localStorage
                const images = JSON.parse(localStorage.getItem('productImages') || '{}');
                images[imagePath] = base64Image;
                localStorage.setItem('productImages', JSON.stringify(images));
            }

            const productoActualizado = {
                nombre: document.getElementById('editarNombre').value,
                categoria: document.getElementById('editarCategoria').value,
                stock: parseInt(document.getElementById('editarStock').value),
                descripcion: document.getElementById('editarDescripcion').value,
                precio: parseFloat(document.getElementById('editarPrecio').value),
                imagen: imagePath,
                estado: 'activo'
            };

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
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }


    previsualizarImagen(e, previewElementId) {
        const file = e.target.files[0];
        const preview = previewElementId;
        if (preview && file) {
            preview.classList.remove('d-none');
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async verProducto(id) {
        try {
            const producto = this.productos.find(p => p.id === id);
            if (!producto) return;

            const images = JSON.parse(localStorage.getItem('productImages') || '{}');
            const imageSrc = images[producto.imagen] || producto.imagen;

            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${imageSrc}" class="img-fluid" alt="${producto.nombre}">
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

    async editarProducto(id) {
        try {
            const producto = this.productos.find(p => p.id === id);
            if (!producto) return;

            // Llenar el formulario de edición
            const form = document.getElementById('editarProductoForm');
            form.querySelector('#editarId').value = producto.id;
            form.querySelector('#editarNombre').value = producto.nombre;
            form.querySelector('#editarCategoria').value = producto.categoria;
            form.querySelector('#editarStock').value = producto.stock;
            form.querySelector('#editarPrecio').value = producto.precio;
            form.querySelector('#editarDescripcion').value = producto.descripcion;

            // Mostrar la imagen actual
            const images = JSON.parse(localStorage.getItem('productImages') || '{}');
            const imageSrc = images[producto.imagen] || producto.imagen;
            const preview = form.querySelector('#editarVistaPrevia');
            if (preview) {
                preview.src = imageSrc;
                preview.classList.remove('d-none');
            }

            const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
            modal.show();
        } catch (error) {
            console.error('Error al editar producto:', error);
            this.mostrarMensaje('Error al cargar el producto', 'danger');
        }
    }

    async eliminarProducto(id) {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            try {
                await this.dataService.deleteProduct(id);
                await this.cargarProductos();
                this.mostrarMensaje('Producto eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                this.mostrarMensaje('Error al eliminar el producto', 'danger');
            }
        }
    }
}

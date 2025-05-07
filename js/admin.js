class ProductosManager {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.initEventListeners();
        this.cargarProductos();
    }

    initEventListeners() {
        // Esperar a que el DOM esté completamente cargado
        const formAgregar = document.getElementById('agregarProductoForm');
        if (formAgregar) {
            formAgregar.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Formulario enviado'); // Para debuggear
                this.agregarProducto();
            });
        }

        const inputImagen = document.getElementById('productoImagen');
        if (inputImagen) {
            inputImagen.addEventListener('change', (e) => {
                this.mostrarVistaPrevia(e.target, 'vistaPrevia');
            });
        }

        // Agregar listeners para filtros
        const buscarProducto = document.getElementById('buscarProducto');
        const filtroCategoria = document.getElementById('filtroCategoria');
        const filtroStock = document.getElementById('filtroStock');

        if (buscarProducto) {
            buscarProducto.addEventListener('input', () => this.filtrarProductos());
        }
        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.filtrarProductos());
        }
        if (filtroStock) {
            filtroStock.addEventListener('change', () => this.filtrarProductos());
        }

        // Agregar listener para editar producto
        const formEditar = document.getElementById('editarProductoForm');
        if (formEditar) {
            formEditar.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarEdicionProducto(e);
            });
        }

        // Agregar listener para preview de imagen en edición
        const editarImagen = document.getElementById('editarImagen');
        if (editarImagen) {
            editarImagen.addEventListener('change', (e) => {
                this.mostrarVistaPrevia(e.target, 'vistaPreviaEditar');
            });
        }
    }

    agregarProducto() {
        const nuevoProducto = {
            id: Date.now(),
            nombre: document.getElementById('productoNombre').value,
            categoria: document.getElementById('productoCategoria').value,
            stock: parseInt(document.getElementById('productoStock').value),
            descripcion: document.getElementById('productoDescripcion').value,
            precio: parseFloat(document.getElementById('productoPrecio').value),
            imagen: this.obtenerUrlImagen('productoImagen'),
            estado: this.determinarEstadoStock(parseInt(document.getElementById('productoStock').value))
        };

        this.productos.push(nuevoProducto);
        this.guardarProductos();
        this.cargarProductos();
        this.mostrarAlerta('Producto agregado exitosamente', 'success');
        this.limpiarFormulario();
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('agregarProductoModal'));
        modal.hide();
    }

    cargarProductos() {
        const tbody = document.querySelector('.table tbody');
        if (!tbody) {
            console.error('No se encontró la tabla de productos');
            return;
        }

        tbody.innerHTML = '';
        this.productos.forEach(producto => {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover;">
                        ${producto.nombre}
                    </td>
                    <td>${producto.categoria}</td>
                    <td>${producto.stock}</td>
                    <td>$${producto.precio.toLocaleString()}</td>
                    <td><span class="badge bg-${this.obtenerColorEstado(producto.estado)}">${producto.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="productosManager.verProducto(${producto.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="productosManager.editarProducto(${producto.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="productosManager.eliminarProducto(${producto.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    guardarProductos() {
        localStorage.setItem('productos', JSON.stringify(this.productos));
    }

    mostrarVistaPrevia(input, previewId) {
        const preview = document.getElementById(previewId);
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    obtenerUrlImagen(inputId) {
        const input = document.getElementById(inputId);
        if (input.files && input.files[0]) {
            return URL.createObjectURL(input.files[0]);
        }
        return '../../assets/images/producto-default.jpg';
    }

    determinarEstadoStock(cantidad) {
        if (cantidad <= 5) return 'Bajo';
        if (cantidad <= 15) return 'Normal';
        return 'Alto';
    }

    obtenerColorEstado(estado) {
        switch (estado) {
            case 'Bajo': return 'danger';
            case 'Normal': return 'warning';
            case 'Alto': return 'success';
            default: return 'secondary';
        }
    }

    limpiarFormulario() {
        document.getElementById('agregarProductoForm').reset();
        document.getElementById('vistaPrevia').classList.add('d-none');
    }

    mostrarAlerta(mensaje, tipo) {
        const alertaContainer = document.getElementById('alertaProductos');
        const alerta = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertaContainer.innerHTML = alerta;
        setTimeout(() => {
            const alertaElement = alertaContainer.querySelector('.alert');
            if (alertaElement) {
                alertaElement.remove();
            }
        }, 3000);
    }

    verProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            document.getElementById('verImagen').src = producto.imagen;
            document.getElementById('verDescripcion').textContent = producto.descripcion;
            document.getElementById('verPrecio').textContent = `$${producto.precio.toLocaleString()}`;
            const modal = new bootstrap.Modal(document.getElementById('verProductoModal'));
            modal.show();
        }
    }

    editarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            // Establecer los valores en el formulario
            const form = document.getElementById('editarProductoForm');
            form.setAttribute('data-producto-id', id); // Cambiado de dataset a setAttribute
            
            // Establecer valores en los campos
            document.getElementById('editarNombre').value = producto.nombre;
            document.getElementById('editarCategoria').value = producto.categoria;
            document.getElementById('editarStock').value = producto.stock;
            document.getElementById('editarDescripcion').value = producto.descripcion;
            document.getElementById('editarPrecio').value = producto.precio;
            
            // Manejar la imagen
            const vistaPreviaEditar = document.getElementById('vistaPreviaEditar');
            if (vistaPreviaEditar) {
                vistaPreviaEditar.src = producto.imagen;
                vistaPreviaEditar.classList.remove('d-none');
            }
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
            modal.show();
        }
    }

    guardarEdicionProducto(e) {
        e.preventDefault();
        
        // Obtener el ID del producto desde el atributo data
        const form = e.target;
        const id = parseInt(form.getAttribute('data-producto-id'));
        const index = this.productos.findIndex(p => p.id === id);
        
        if (index !== -1) {
            // Crear objeto con datos actualizados
            const productoEditado = {
                ...this.productos[index],
                nombre: document.getElementById('editarNombre').value,
                categoria: document.getElementById('editarCategoria').value,
                stock: parseInt(document.getElementById('editarStock').value),
                descripcion: document.getElementById('editarDescripcion').value,
                precio: parseFloat(document.getElementById('editarPrecio').value),
                estado: this.determinarEstadoStock(parseInt(document.getElementById('editarStock').value))
            };

            // Manejar la imagen si se seleccionó una nueva
            const inputImagen = document.getElementById('editarImagen');
            if (inputImagen && inputImagen.files && inputImagen.files[0]) {
                productoEditado.imagen = this.obtenerUrlImagen('editarImagen');
            }

            // Actualizar el producto
            this.productos[index] = productoEditado;
            this.guardarProductos();
            this.cargarProductos();
            
            // Mostrar mensaje de éxito
            this.mostrarAlerta('Producto actualizado exitosamente', 'success');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarProductoModal'));
            if (modal) modal.hide();
        }
    }

    eliminarProducto(id) {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            this.productos = this.productos.filter(p => p.id !== id);
            this.guardarProductos();
            this.cargarProductos();
            this.mostrarAlerta('Producto eliminado exitosamente', 'warning');
        }
    }

    filtrarProductos() {
        const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
        const categoria = document.getElementById('filtroCategoria').value;
        const stock = document.getElementById('filtroStock').value;

        const productosFiltrados = this.productos.filter(producto => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda);
            const coincidenFiltros = 
                (categoria === '' || producto.categoria === categoria) &&
                (stock === '' || this.coincideEstadoStock(producto.stock, stock));
            
            return coincideBusqueda && coincidenFiltros;
        });

        this.actualizarTablaProductos(productosFiltrados);
    }

    coincideEstadoStock(cantidad, filtro) {
        switch (filtro) {
            case 'bajo': return cantidad <= 5;
            case 'normal': return cantidad > 5 && cantidad <= 15;
            case 'alto': return cantidad > 15;
            default: return true;
        }
    }

    actualizarTablaProductos(productos) {
        const tbody = document.querySelector('.table tbody');
        if (!tbody) return;

        tbody.innerHTML = productos.length === 0 ? 
            '<tr><td colspan="6" class="text-center">No se encontraron productos</td></tr>' :
            productos.map(producto => `
                <tr>
                    <td>
                        <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover;">
                        ${producto.nombre}
                    </td>
                    <td>${producto.categoria}</td>
                    <td>${producto.stock}</td>
                    <td>$${producto.precio.toLocaleString()}</td>
                    <td><span class="badge bg-${this.obtenerColorEstado(producto.estado)}">${producto.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="productosManager.verProducto(${producto.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="productosManager.editarProducto(${producto.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="productosManager.eliminarProducto(${producto.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }
}

// Inicialización
const productosManager = new ProductosManager();
window.productosManager = productosManager; 






class AdminManager {
    constructor() {
        this.productosManager = new ProductosManager();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupWelcomeScreen();
            this.setupNavigation();
        });
    }

    setupWelcomeScreen() {
        setTimeout(() => {
            document.getElementById('bienvenida').style.display = 'none';
            this.cargarSeccion('dashboard');
        }, 2000);
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const seccion = e.target.closest('.nav-link').getAttribute('data-section');
                this.cargarSeccion(seccion);
                this.actualizarNavegacionActiva(e.target.closest('.nav-link'));
            });
        });
    }

    actualizarNavegacionActiva(elementoActivo) {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        elementoActivo.classList.add('active');
    }

    cargarSeccion(seccion) {
        const contentContainer = document.getElementById('content-container');
        
        contentContainer.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;
        
        fetch(`${seccion}.html`)
            .then(response => {
                if (!response.ok) throw new Error('No se pudo cargar la sección');
                return response.text();
            })
            .then(html => {
                contentContainer.innerHTML = html;
                // Inicializar componentes específicos
                if (seccion === 'inventario') {
                    this.productosManager.initEventListeners();
                    this.productosManager.cargarProductos();
                }
            })
            .catch(error => {
                this.mostrarError(error.message);
            });
    }

    mostrarError(mensaje) {
        const contentContainer = document.getElementById('content-container');
        contentContainer.innerHTML = `
            <div class="alert alert-danger m-4" role="alert">
                Error al cargar la sección: ${mensaje}
            </div>
        `;
        console.error('Error:', mensaje);
    }

    static cerrarSesion() {
        if(confirm('¿Está seguro de cerrar sesión?')) {
            window.location.href = '../login.html';
        }
    }
}

// Inicialización
const adminManager = new AdminManager();

// Exportar función de cerrar sesión como global
window.cerrarSesion = AdminManager.cerrarSesion;

// Manejo global de errores
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    adminManager.productosManager.mostrarAlerta('Ha ocurrido un error en la aplicación', 'danger');
});
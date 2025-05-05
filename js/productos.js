// Array para almacenar los productos
let productos = JSON.parse(localStorage.getItem('productos')) || [];

// Función para inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    // Cargar productos existentes
    cargarProductos();

    // Configurar el formulario de agregar producto
    const agregarProductoForm = document.getElementById('agregarProductoForm');
    if (agregarProductoForm) {
        agregarProductoForm.addEventListener('submit', function (e) {
            e.preventDefault();
            agregarProducto();
        });
    }

    // Configurar vista previa de imagen
    const productoImagen = document.getElementById('productoImagen');
    if (productoImagen) {
        productoImagen.addEventListener('change', function () {
            mostrarVistaPrevia(this, 'vistaPrevia');
        });
    }

    // Configurar vista previa de imagen en editar
    const editarImagen = document.getElementById('editarImagen');
    if (editarImagen) {
        editarImagen.addEventListener('change', function () {
            mostrarVistaPrevia(this, 'vistaPreviaEditar');
        });
    }

    // Configurar formulario de edición
    const editarProductoForm = document.getElementById('editarProductoForm');
    if (editarProductoForm) {
        editarProductoForm.addEventListener('submit', function (e) {
            e.preventDefault();
            guardarEdicionProducto();
        });
    }
});

// Función para mostrar vista previa de imagen
function mostrarVistaPrevia(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// Función para agregar un nuevo producto
function agregarProducto() {
    // Obtener valores del formulario
    const nombre = document.getElementById('productoNombre').value;
    const categoria = document.getElementById('productoCategoria').value;
    const stock = document.getElementById('productoStock').value;
    const descripcion = document.getElementById('productoDescripcion').value;
    const precio = document.getElementById('productoPrecio').value;

    // Manejar la imagen
    const imagenInput = document.getElementById('productoImagen');
    let imagenUrl = '../assets/images/default-product.jpg'; // Imagen por defecto

    if (imagenInput.files && imagenInput.files[0]) {

        imagenUrl = URL.createObjectURL(imagenInput.files[0]);
    }

    // Crear objeto de producto
    const nuevoProducto = {
        id: Date.now(),
        nombre,
        categoria,
        stock,
        descripcion,
        precio,
        imagen: imagenUrl
    };

    // Agregar al array de productos
    productos.push(nuevoProducto);

    // Guardar en localStorage
    localStorage.setItem('productos', JSON.stringify(productos));

    // Actualizar la tabla
    cargarProductos();

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('agregarProductoModal'));
    modal.hide();

    // Limpiar el formulario
    document.getElementById('agregarProductoForm').reset();

    // Ocultar vista previa
    const vistaPrevia = document.getElementById('vistaPrevia');
    if (vistaPrevia) {
        vistaPrevia.classList.add('d-none');
    }

    // Mostrar mensaje de éxito
    mostrarAlerta('Producto agregado con éxito', 'success');
}

// Función para cargar productos en la tabla
function cargarProductos() {
    const tablaProductos = document.querySelector('#inventario table tbody');
    if (!tablaProductos) return;

    // Limpiar tabla
    tablaProductos.innerHTML = '';

    // Si no hay productos, mostrar mensaje
    if (productos.length === 0) {
        tablaProductos.innerHTML = '<tr><td colspan="4" class="text-center">No hay productos disponibles</td></tr>';
        return;
    }

    // Agregar cada producto a la tabla
    productos.forEach(producto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stock}</td>
            <td>
                <button
                    class="btn btn-info btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#verProductoModal"
                    onclick="verProducto('${producto.nombre}', '${producto.categoria}', '${producto.stock}', '${producto.descripcion}', '${producto.precio}', '${producto.imagen}')">
                    Ver
                </button>
                <button
                    class="btn btn-warning btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editarProductoModal"
                    onclick="editarProducto('${producto.id}')">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </td>
        `;
        tablaProductos.appendChild(fila);
    });
}

// Función para ver detalles de un producto
function verProducto(nombre, categoria, stock, descripcion, precio, imagen) {
    document.getElementById('verProductoModalLabel').textContent = nombre;
    document.getElementById('verImagen').src = imagen;
    document.getElementById('verDescripcion').textContent = descripcion;
    document.getElementById('verPrecio').textContent = precio;
}

// Función para editar un producto
function editarProducto(id) {
    // Encontrar el producto por ID
    const producto = productos.find(p => p.id == id);
    if (!producto) return;

    // Guardar el ID del producto que se está editando
    document.getElementById('editarProductoForm').dataset.productoId = id;

    // Llenar el formulario con los datos actuales
    document.getElementById('editarDescripcion').value = producto.descripcion;
    document.getElementById('editarPrecio').value = producto.precio;

    // Mostrar imagen actual
    const vistaPreviaEditar = document.getElementById('vistaPreviaEditar');
    if (vistaPreviaEditar) {
        vistaPreviaEditar.src = producto.imagen;
        vistaPreviaEditar.classList.remove('d-none');
    }
}

// Función para guardar la edición de un producto
function guardarEdicionProducto() {
    // Obtener el ID del producto que se está editando
    const productoId = document.getElementById('editarProductoForm').dataset.productoId;

    // Encontrar el producto por ID
    const index = productos.findIndex(p => p.id == productoId);

    if (index !== -1) {
        // Actualizar los datos del producto
        productos[index].descripcion = document.getElementById('editarDescripcion').value;
        productos[index].precio = document.getElementById('editarPrecio').value;

        // Manejar la imagen si se cambió
        const imagenInput = document.getElementById('editarImagen');
        if (imagenInput.files && imagenInput.files[0]) {
            productos[index].imagen = URL.createObjectURL(imagenInput.files[0]);
        }

        // Guardar cambios
        localStorage.setItem('productos', JSON.stringify(productos));

        // Actualizar la tabla
        cargarProductos();

        // Cerrar el modal
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editarProductoModal'));
        modalInstance.hide();

        // Mostrar mensaje de éxito
        mostrarAlerta('Producto actualizado con éxito', 'success');
    }
}

// Función para eliminar un producto
function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        // Filtrar el producto a eliminar
        productos = productos.filter(producto => producto.id != id);

        // Guardar cambios
        localStorage.setItem('productos', JSON.stringify(productos));

        // Actualizar la tabla
        cargarProductos();

        // Mostrar mensaje de éxito
        mostrarAlerta('Producto eliminado con éxito', 'warning');
    }
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {

    let alertPlaceholder = document.getElementById('alertaProductos');
    if (!alertPlaceholder) {
        alertPlaceholder = document.createElement('div');
        alertPlaceholder.id = 'alertaProductos';
        alertPlaceholder.className = 'mt-3';

        // Insertar antes de la tabla
        const container = document.querySelector('#inventario .content');
        if (container) {
            const tabla = container.querySelector('.table-responsive');
            container.insertBefore(alertPlaceholder, tabla);
        }
    }

    // Crear alerta
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertPlaceholder.appendChild(wrapper);

    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        const alert = wrapper.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 3000);
}

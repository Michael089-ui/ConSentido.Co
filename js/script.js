document.addEventListener('DOMContentLoaded', function() {
    const tarjetas = document.querySelectorAll('.equipo-card');
  
    tarjetas.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('rotar');
      });
  
      card.addEventListener('mouseleave', () => {
        card.classList.remove('rotar');
      });
    });

    fetch('/components/nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbard').innerHTML = data;
        })
        .catch(error => console.error('Error cargando el navbar:', error));
    
    fetch('/components/footer.html')
        .then(response => response.text())
        .then(data => {
          document.getElementById('footer-content').innerHTML = data;
        });
  });


  async function cargarProductosDestacados() {
    try {
        const response = await fetch('/api/productos/destacados');
        const productos = await response.json();
        
        const contenedorProductos = document.querySelector('.productos-destacados .row');
        contenedorProductos.innerHTML = ''; // Limpiar el contenedor
        
        productos.forEach(producto => {
            const cardHTML = `
                <div class="col-md-4">
                    <div class="card h-100">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text">${producto.descripcion}</p>
                            <p class="precio">$${producto.precio.toLocaleString()}</p>
                            <button class="btn btn-primary" onclick="verDetallesProducto(${producto.id})">Ver detalles</button>
                        </div>
                    </div>
                </div>
            `;
            contenedorProductos.innerHTML += cardHTML;
        });
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
    }
}

function verDetallesProducto(id) {
    window.location.href = `/producto.html?id=${id}`;
}

class ProductosVista {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.categoria = document.body.dataset.categoria; 
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.mostrarProductos();
        });
    }

    mostrarProductos() {
        const contenedor = document.getElementById('productos-container');
        if (!contenedor) return;

        const productosFiltrados = this.productos.filter(producto => 
            producto.categoria.toLowerCase() === this.categoria.toLowerCase()
        );

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    No hay productos disponibles en esta categoría.
                </div>
            `;
            return;
        }

        contenedor.innerHTML = `
            <div class="row row-cols-1 row-cols-md-3 g-4">
                ${productosFiltrados.map(producto => this.crearTarjetaProducto(producto)).join('')}
            </div>
        `;
    }

    crearTarjetaProducto(producto) {
        return `
            <div class="col">
                <div class="card h-100">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">${producto.descripcion}</p>
                        <p class="card-text">
                            <small class="text-muted">Stock: ${producto.stock} unidades</small>
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">$${producto.precio.toLocaleString()}</span>
                            <button class="btn btn-primary" onclick="productosVista.agregarAlCarrito(${producto.id})">
                                <i class="fas fa-shopping-cart"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    agregarAlCarrito(id) {
        // Implementar función de agregar los productos aal carrito
        alert('Función de carrito en desarrollo');
    }
}

const productosVista = new ProductosVista();


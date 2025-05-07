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
<<<<<<< HEAD
  function agregarProducto(){
    const nombre = document.getElementById(productoNombre).value;
    const categoria = document.getElementById(productoCategoria).value;
    const stock = document.getElementById(productoStock).value;
    const descripcion = document.getElementById(productoDescripcion).value;
    const precio = document.getElementById(productoPrecio).value;
    const nuevoproducto = {nombre,categoria,st}
  }
=======


  async function cargarProductosDestacados() {
    try {
        const response = await fetch('/api/productos/destacados');
        const productos = await response.json();
        
        const contenedorProductos = document.querySelector('.productos-destacados .row');
        contenedorProductos.innerHTML = ''; // Limpiar contenedor
        
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

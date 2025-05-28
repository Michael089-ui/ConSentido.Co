document.addEventListener('DOMContentLoaded', function() {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
renderizarCarrito();
actualizarResumenCarrito();
actualizarContadorCarrito();

// Esperar a que la navbar se cargue antes de actualizar el contador
const observer = new MutationObserver(() => {
  if (document.querySelector('.nav-icon .badge')) {
    actualizarContadorCarrito();
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

  function actualizarContadorCarrito() {
    const contador = document.querySelector('.nav-icon .badge');
    if (contador) {
       const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    contador.textContent = carritoActual.length;
    }
  }

  function actualizarResumenCarrito() {
    document.getElementById('summary-count').textContent = carrito.length;
    const subtotal = carrito.reduce((sum, item) => sum + parseFloat(item.precio.replace(/\./g, '').replace(',', '.')), 0);
    document.getElementById('summary-subtotal').textContent = '$' + subtotal.toLocaleString('es-CO');
  }

  function renderizarCarrito() {
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
      cartContainer.innerHTML = carrito.map(item => `
        <div class="card mb-3">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5>${item.nombre}</h5>
              <p class="mb-0">${item.precio}</p>
            </div>
            <button class="btn btn-danger btn-sm quitar-carrito" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.quitar-carrito').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          carrito = carrito.filter(item => item.id !== id);
          localStorage.setItem('carrito', JSON.stringify(carrito));
          actualizarContadorCarrito();
          renderizarCarrito();
          actualizarResumenCarrito();
        });
      });
    }
  }

  if (document.getElementById('checkoutBtn')) {
    document.getElementById('checkoutBtn').addEventListener('click', function () {
      if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
      }

      const nombreCliente = localStorage.getItem('nombreCliente') || 'Cliente anónimo';

      const pedido = {
        id: 'pedido-' + Date.now(),
        cliente: nombreCliente,
        fecha: new Date().toLocaleString(),
        productos: carrito
      };

      let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
      pedidos.push(pedido);
      localStorage.setItem('pedidos', JSON.stringify(pedidos));

      carrito = [];
      localStorage.setItem('carrito', JSON.stringify(carrito));
      actualizarContadorCarrito();
      renderizarCarrito();
      actualizarResumenCarrito();

      const modal = new bootstrap.Modal(document.getElementById('compraExitosaModal'));
modal.show();
    });
  }

  renderizarCarrito();
  actualizarResumenCarrito();
  actualizarContadorCarrito();
});

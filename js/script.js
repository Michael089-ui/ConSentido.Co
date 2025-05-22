// script.js - Lógica de Carrito y Carga Dinámica de Navbar/Footer

// 1. Inicializa y actualiza el contador del carrito (badge)
function initCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = totalItems;
}

// 2. Renderiza el carrito dentro de #cartContainer
function renderCart() {
  const container = document.getElementById('cartContainer');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  // Carrito vacío
  if (cart.length === 0) {
    container.innerHTML = 
      `<div class="alert alert-info">
         Aún no ha añadido productos al carrito de compras, por favor explora nuestras categorías.
       </div>`;
    updateSummary(); // Actualiza el resumen incluso si el carrito está vacío
    return;
  }

  // Lista de productos
  let html = '';
  cart.forEach(item => {
    html += `
      <div class="cart-item">
        <div class="d-flex align-items-center">
          <img src="${item.image || '/assets/images/default.png'}" alt="${item.name}">
          <div class="info ms-3">
            <h6 class="mb-1">${item.name}</h6>
            <small>${item.price.toLocaleString('es-CO',{style:'currency',currency:'COP'})}</small>
          </div>
        </div>
        <div class="actions d-flex align-items-center">
          <button class="btn btn-outline-secondary btn-sm me-1" onclick="updateQty(${item.id}, -1)"><i class="fas fa-minus"></i></button>
          <span>${item.quantity}</span>
          <button class="btn btn-outline-secondary btn-sm ms-1 me-3" onclick="updateQty(${item.id}, 1)"><i class="fas fa-plus"></i></button>
          <button class="btn btn-danger btn-sm" onclick="removeItem(${item.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  });

  // Resumen de compra
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Elimina el botón "Ir a Pagar" del resumen principal
  html += `
    <div class="cart-summary mt-4 p-3">
      <h5>Resumen</h5>
      <p>Subtotal: <strong>${subtotal.toLocaleString('es-CO',{style:'currency',currency:'COP'})}</strong></p>
    </div>
  `;

  container.innerHTML = html;

  // Mostrar modal de login al clicar en pagar
  document.querySelectorAll('.btn-checkout').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('loginModal'));
      modal.show();
    });
  });

  updateSummary(); // Actualiza el resumen después de renderizar el carrito
}

// Actualiza el resumen del carrito en el panel derecho
function updateSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const summaryCount = document.getElementById('summary-count');
  const summarySubtotal = document.getElementById('summary-subtotal');

  if (summaryCount) summaryCount.textContent = totalItems;
  if (summarySubtotal) summarySubtotal.textContent = subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

// 3. Actualiza cantidad de un ítem
function updateQty(id, delta) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.map(item =>
    item.id === id
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item
  );
  localStorage.setItem('cart', JSON.stringify(cart));
  initCartCounter();
  renderCart();
}

// 4. Elimina un ítem del carrito
function removeItem(id) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  initCartCounter();
  renderCart();
}

// 5. Carga dinámica y arranque de funcionalidades
document.addEventListener('DOMContentLoaded', () => {
  // Cargar Navbar
  fetch('/components/nav.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('navbard').innerHTML = html;
      initCartCounter();  // Actualiza badge después de inyectar navbar
    })
    .catch(err => console.error('Error cargando navbar:', err));

  // Cargar Footer
  fetch('/components/footer.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('footer-content').innerHTML = html;
    })
    .catch(err => console.error('Error cargando footer:', err));

  // Renderizar carrito si existe contenedor
  if (document.getElementById('cartContainer')) {
    renderCart();
  }
});

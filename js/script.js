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
  function agregarProducto(){
    const nombre = document.getElementById(productoNombre).value;
    const categoria = document.getElementById(productoCategoria).value;
    const stock = document.getElementById(productoStock).value;
    const descripcion = document.getElementById(productoDescripcion).value;
    const precio = document.getElementById(productoPrecio).value;
    const nuevoproducto = {nombre,categoria,st}
  }
  document.getElementById('newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault(); // Evita que se recargue la página
        document.getElementById('thank-you-msg').style.display = 'block'; // Muestra el mensaje
        this.reset(); // Limpia el campo de email
    });
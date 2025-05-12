
const eyeIcon = document.getElementById('eye-icon');
const passwordField = document.getElementById('password');

eyeIcon.addEventListener('click', function() {
  
  if (passwordField.type === 'password') {
    passwordField.type = 'text'; // Muestra la contraseña
    eyeIcon.classList.remove('fa-eye'); // Cambia el ícono
    eyeIcon.classList.add('fa-eye-slash'); // Cambia el ícono al de "ojo tachado"
  } else {
    passwordField.type = 'password'; // Oculta la contraseña
    eyeIcon.classList.remove('fa-eye-slash'); // Vuelve al ícono del ojo
    eyeIcon.classList.add('fa-eye'); // Cambia el ícono al de "ojo"
  }
});

// Obtener los elementos
const showPopup = document.getElementById('showPopup');
const popupWindow = document.getElementById('popupWindow');
const closePopup = document.getElementById('closePopup');

// Mostrar la ventana emergente
showPopup.addEventListener('click', function(event) {
  event.preventDefault(); // Evitar que el enlace navegue a otra página
  popupWindow.style.display = 'flex'; // Mostrar la ventana emergente
});

// Cerrar la ventana emergente
closePopup.addEventListener('click', function() {
  popupWindow.style.display = 'none'; // Ocultar la ventana emergente
});

// Cerrar la ventana emergente si se hace clic fuera de ella
window.addEventListener('click', function(event) {
  if (event.target === popupWindow) {
    popupWindow.style.display = 'none';
  }
});

  

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

// Restablecer contra
const showPopup = document.getElementById('showPopup');
const popupWindow = document.getElementById('popupWindow');
const closePopup = document.getElementById('closePopup');

showPopup.addEventListener('click', function(event) {
  event.preventDefault(); 
  popupWindow.style.display = 'flex'; 
});

// Cerrar la ventana restablecer contra
closePopup.addEventListener('click', function() {
  popupWindow.style.display = 'none'; 
});

// Cerrar la ventana restablecer contra, si se hace clic fuera de ella
window.addEventListener('click', function(event) {
  if (event.target === popupWindow) {
    popupWindow.style.display = 'none';
  }
});

  
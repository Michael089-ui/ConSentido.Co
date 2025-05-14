
    // Ocultar todas las secciones menos la de bienvenida
document.addEventListener("DOMContentLoaded", function () {
    const secciones = document.querySelectorAll("#main-content section");
    const enlacesSidebar = document.querySelectorAll("#sidebar a[href^='#']");

    secciones.forEach(seccion => {
      if (seccion.id !== "bienvenida") {
        seccion.style.display = "none";
      }
    });

    enlacesSidebar.forEach(enlace => {
      enlace.addEventListener("click", function (e) {
        e.preventDefault();

        const destino = this.getAttribute("href").substring(1);

        secciones.forEach(seccion => {
          if (seccion.id === destino) {
            seccion.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" }); 
          } else {
            seccion.style.display = "none";
          }
        });
      });
    });

    // Evita navegación con el scroll
    document.body.style.overflow = "hidden";

    document.querySelectorAll("#main-content section").forEach(section => {
      section.style.overflow = "auto";
    });
  });


  //Sesion PerfilAdm 
  
const form = document.querySelector('.perfil-form');
const nombreInput = document.getElementById('nombre');
const correoInput = document.getElementById('correo');
const telefonoInput = document.getElementById('telefono');
const rolInput = document.getElementById('rol');
const fotoInput = document.getElementById('foto');

const perfilNombre = document.querySelector('#sidebar p');

// Función que maneja el submit del formulario
form.addEventListener('submit', function (event) {
  event.preventDefault(); 

  const nombre = nombreInput.value;
  const correo = correoInput.value;
  const telefono = telefonoInput.value;
  const rol = rolInput.value;

  const foto = fotoInput.files[0];
  const fotoURL = foto ? URL.createObjectURL(foto) : "../assets/images/fotoPerfil.png";

  perfilNombre.textContent = nombre ? `Bienvenido, ${nombre}` : "Administrador";

  //actualizar la imagen de perfil en el sidebar
  const sidebarImg = document.querySelector('#sidebar img');
  sidebarImg.src = fotoURL;

  form.reset();
});
const fotoURL = foto ? URL.createObjectURL(foto) : "../assets/images/fotoPerfil.png";

sidebarImg.style.width = "50px"; 
sidebarImg.style.height = "50px";
sidebarImg.style.borderRadius = "50%";
sidebarImg.style.objectFit = "cover";

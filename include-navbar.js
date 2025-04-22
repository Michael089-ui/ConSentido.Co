// Animaciones llamativas para la navbar superior y lateral
document.addEventListener("DOMContentLoaded", () => {
  // Cargar navbar desde archivo externo si se usa contenedor
  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) {
    fetch("nav.html")
      .then((response) => response.text())
      .then((data) => {
        navbarContainer.innerHTML = data;
        iniciarAnimaciones();
      })
      .catch((error) => {
        console.error("Error al cargar la navbar:", error);
      });
  } else {
    iniciarAnimaciones();
  }
});

function iniciarAnimaciones() {
  // Animación para enlaces al pasar el mouse
  const enlaces = document.querySelectorAll(".navbar-top .nav-link, .navbar ul li a");
  enlaces.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      link.style.transform = "scale(1.1)";
      link.style.transition = "transform 0.3s ease";
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = "scale(1)";
    });
  });

  // Animación de entrada para la navbar lateral
  const toggle = document.querySelector(".navbar-toggle");
  const sidebar = document.querySelector(".navbar-toggle .navbar");
  if (toggle && sidebar) {
    toggle.addEventListener("mouseenter", () => {
      sidebar.animate(
        [
          { opacity: 0, transform: "translateX(-20px)" },
          { opacity: 1, transform: "translateX(0)" }
        ],
        {
          duration: 400,
          easing: "ease-out",
          fill: "forwards"
        }
      );
    });
  }

  // Pequeño rebote para el ícono de usuario
  const userIcon = document.querySelector(".fa-user");
  if (userIcon) {
    userIcon.addEventListener("mouseenter", () => {
      userIcon.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.2) rotate(10deg)" },
          { transform: "scale(1) rotate(0deg)" }
        ],
        {
          duration: 500,
          easing: "ease-out"
        }
      );
    });
  }
}
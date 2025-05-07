// Animación de logo cada 5 segundos
document.addEventListener("DOMContentLoaded", function () {
  const logo = document.querySelector(".logo-img");

  if (logo) {
    setInterval(() => {
      logo.classList.add("logo-grow");

      setTimeout(() => {
        logo.classList.remove("logo-grow");
      }, 1000);

    }, 5000);
  }

  // Cargar navbar en #nav-placeholder
  fetch("/components/navbar.html")
    .then(response => response.text())
    .then(data => {
      const navPlaceholder = document.getElementById("nav-placeholder");
      if (navPlaceholder) {
        navPlaceholder.innerHTML = data;
      }
    })
    .catch(error => console.error("Error cargando navbar.html:", error));

  // Cargar nav en #navbard si existe
  fetch("/components/nav.html")
    .then(response => response.text())
    .then(data => {
      const navbard = document.getElementById("navbard");
      if (navbard) {
        navbard.innerHTML = data;
      }
    })
    .catch(error => console.error("Error cargando nav.html:", error));

  // Cargar footer en #footer-content
  fetch("/components/footer.html")
    .then(response => response.text())
    .then(data => {
      const footerContent = document.getElementById("footer-content");
      if (footerContent) {
        footerContent.innerHTML = data;
      }
    })
    .catch(error => console.error("Error cargando footer.html:", error));
});

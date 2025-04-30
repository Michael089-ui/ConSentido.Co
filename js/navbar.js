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
});

window.addEventListener("DOMContentLoaded", function () {
  fetch("/components/navbar.html") // o "../components/navbar.html" si está en otra carpeta
    .then(response => response.text())
    .then(data => {
      document.getElementById("nav-placeholder").innerHTML = data;
    });
});

// $(document).ready(function () {
//   $('#nav-placeholder').load('/components/nav.html', function (response, status, xhr) {
//     if (status == 'error') {
//       console.log('Error loading nav:', xhr.status, xhr.statusText);
//     }
//   });
// });

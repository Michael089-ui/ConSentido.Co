document.addEventListener("DOMContentLoaded", function() {
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
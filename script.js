document.addEventListener('DOMContentLoaded', () => {
    const tarjetas = document.querySelectorAll('.equipo-card');
  
    tarjetas.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('rotar');
      });
  
      card.addEventListener('mouseleave', () => {
        card.classList.remove('rotar');
      });
    });
  });
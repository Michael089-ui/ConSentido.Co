document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('Vende');
  const formSuperior = document.querySelector('.form-superior');
  const formInferior = document.querySelector('.form-inferior');

  const modal = document.getElementById('modal-success');
  const modalClose = document.getElementById('modal-close');

  // Establecer fondo por defecto
  document.body.classList.add('fondo-urgente');

  // Cambiar formularios y fondo según estado del checkbox
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      formSuperior.style.display = 'none';
      formInferior.style.display = 'block';

      document.body.classList.remove('fondo-urgente');
      document.body.classList.add('fondo-claro');
    } else {
      formSuperior.style.display = 'block';
      formInferior.style.display = 'none';

      document.body.classList.remove('fondo-urgente');
      document.body.classList.add('fondo-claro');
    }
  });

  // Función para mostrar modal
  function showModal() {
    modal.style.display = 'flex';
  }

  // Cerrar modal
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Enviar formulario superior
  formSuperior.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(formSuperior);

    fetch(formSuperior.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        formSuperior.reset();
        showModal();
      } else {
        alert('Error al enviar el formulario');
      }
    }).catch(() => alert('Error al enviar el formulario'));
  });

  // Enviar formulario inferior
  formInferior.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(formInferior);

    fetch(formInferior.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        formInferior.reset();
        showModal();
      } else {
        alert('Error al enviar el formulario');
      }
    }).catch(() => alert('Error al enviar el formulario'));
  });
});

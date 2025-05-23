document.addEventListener('DOMContentLoaded', function() {
    const switchVender = document.getElementById('Vende');
    const formSuperior = document.querySelector('.form-superior');
    const formInferior = document.querySelector('.form-inferior');
    const mainContainer = document.querySelector('main');

    // Manejar el cambio del switch
    switchVender.addEventListener('change', function() {
        if (this.checked) {
            formSuperior.style.display = 'none';
            formInferior.style.display = 'block';
            mainContainer.style.backgroundColor = '#f8f4e9'; // Color beige claro
        } else {
            formSuperior.style.display = 'block';
            formInferior.style.display = 'none';
            mainContainer.style.backgroundColor = 'white';
        }
    });

    // Manejar envío de formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showSuccessModal();
                } else {
                    throw new Error('Error al enviar el formulario');
                }
            } catch (error) {
                showMessage('Error al enviar el formulario. Por favor intente nuevamente.', 'danger');
            }
        });
    });

    function showSuccessModal() {
        const modalHtml = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body text-center py-4">
                            <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                            <h4>¡Mensaje enviado con éxito!</h4>
                            <p>Gracias por contactarnos. Nos comunicaremos contigo pronto.</p>
                            <button class="btn btn-warning mt-3" onclick="window.location.href='/index.html'">
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        // Remover el modal cuando se cierre
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
            window.location.href = '/index.html';
        });
    }

    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('main').prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
});
/**
 * Servicio para manejar elementos de interfaz de usuario
 * Centraliza la lógica de mensajes, alertas y modales
 */
export class UIService {
  /**
   * Muestra un mensaje de alerta en la interfaz
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de alerta (success, danger, warning, info)
   * @param {HTMLElement} container - Contenedor donde mostrar la alerta (opcional)
   * @param {number} timeout - Tiempo en ms para ocultar la alerta (0 para no ocultar)
   */
  showMessage(message, type = 'info', container = document.body, timeout = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `;
    
    // Si el contenedor no es el body, insertar al inicio
    if (container === document.body) {
      alertDiv.classList.add('position-fixed', 'top-0', 'end-0', 'm-3');
      alertDiv.style.zIndex = '1050';
    }
    
    container.prepend(alertDiv);
    
    // Ocultar después del tiempo especificado
    if (timeout > 0) {
      setTimeout(() => alertDiv.remove(), timeout);
    }
    
    return alertDiv;
  }

  /**
   * Crea y muestra un modal con contenido personalizable
   * @param {Object} options - Opciones del modal
   * @returns {Object} - Objeto con el modal y métodos para controlarlo
   */
  createModal(options = {}) {
    const {
      id = 'appModal',
      title = '',
      content = '',
      size = 'modal-md',
      closeButton = true,
      backdrop = 'static',
      onClose = null
    } = options;
    
    // Verificar si bootstrap está disponible
    if (typeof bootstrap === 'undefined') {
      console.error('Bootstrap no está disponible. Asegúrese de incluir Bootstrap JS.');
      return null;
    }
    
    // Verificar si ya existe un modal con este ID
    let modalElement = document.getElementById(id);
    
    // Si existe, removerlo para evitar duplicados
    if (modalElement) {
      // Eliminar instancia de Bootstrap si existe
      const oldModal = bootstrap.Modal.getInstance(modalElement);
      if (oldModal) oldModal.dispose();
      
      modalElement.remove();
    }
    
    // Crear estructura del modal
    const modalHTML = `
      <div class="modal fade" id="${id}" tabindex="-1" data-bs-backdrop="${backdrop}">
        <div class="modal-dialog ${size}">
          <div class="modal-content">
            ${title ? `
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              ${closeButton ? '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' : ''}
            </div>
            ` : ''}
            <div class="modal-body" id="${id}-content">
              ${content}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Insertar el modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modalElement = document.getElementById(id);
    
    // Manejar evento de cierre si se proporciona una función
    if (onClose) {
      modalElement.addEventListener('hidden.bs.modal', onClose);
    }
    
    // Inicializar el modal de Bootstrap
    const modal = new bootstrap.Modal(modalElement);
    
    // Devolver objeto con el modal y métodos para controlarlo
    return {
      modal,
      element: modalElement,
      contentElement: document.getElementById(`${id}-content`),
      show: () => modal.show(),
      hide: () => modal.hide(),
      dispose: () => {
        // Limpiar correctamente los recursos
        if (onClose) {
          modalElement.removeEventListener('hidden.bs.modal', onClose);
        }
        modal.dispose();
        modalElement.remove();
      },
      setContent: (newContent) => {
        const contentElem = document.getElementById(`${id}-content`);
        if (contentElem) contentElem.innerHTML = newContent;
      }
    };
  }

  /**
   * Muestra un diálogo de confirmación
   * @param {Object} options - Opciones del diálogo
   * @returns {Promise<boolean>} - Promesa que se resuelve con true (confirmar) o false (cancelar)
   */
  confirm(options = {}) {
    const {
      title = '¿Está seguro?',
      message = '¿Desea continuar con esta acción?',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      confirmButtonType = 'danger',
      size = 'modal-sm'
    } = options;
    
    return new Promise((resolve) => {
      // Crear contenido del modal
      const content = `
        <div class="text-center py-4">
          <p>${message}</p>
          <div class="d-flex justify-content-center gap-2 mt-4">
            <button class="btn btn-secondary" id="btn-cancel">${cancelText}</button>
            <button class="btn btn-${confirmButtonType}" id="btn-confirm">${confirmText}</button>
          </div>
        </div>
      `;
      
      // Crear modal
      const confirmModal = this.createModal({
        id: 'confirmModal',
        title,
        content,
        size,
        closeButton: true,
        onClose: () => resolve(false)
      });
      
      // Si no se pudo crear el modal, resolver con false
      if (!confirmModal) {
        console.error('No se pudo crear el modal de confirmación');
        resolve(false);
        return;
      }
      
      // Mostrar modal
      confirmModal.show();
      
      // Configurar botones
      const confirmBtn = document.getElementById('btn-confirm');
      const cancelBtn = document.getElementById('btn-cancel');
      
      // Manejadores de eventos para los botones
      const handleConfirm = () => {
        cleanupListeners();
        confirmModal.hide();
        resolve(true);
      };
      
      const handleCancel = () => {
        cleanupListeners();
        confirmModal.hide();
        resolve(false);
      };
      
      // Función para limpiar los event listeners
      const cleanupListeners = () => {
        if (confirmBtn) confirmBtn.removeEventListener('click', handleConfirm);
        if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
      };
      
      // Agregar event listeners
      if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
      if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    });
  }
  
  /**
   * Muestra un mensaje de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {HTMLElement} container - Contenedor donde mostrar el mensaje
   * @param {number} timeout - Tiempo en ms para ocultar el mensaje
   */
  showSuccess(message, container = document.body, timeout = 3000) {
    return this.showMessage(message, 'success', container, timeout);
  }
  
  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje de error
   * @param {HTMLElement} container - Contenedor donde mostrar el error
   * @param {number} timeout - Tiempo en ms para ocultar el mensaje
   */
  showError(message, container = document.body, timeout = 3000) {
    return this.showMessage(message, 'danger', container, timeout);
  }
}
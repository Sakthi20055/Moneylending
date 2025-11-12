// Notification system with styled toasts
function showNotification(message, type = 'info', title = null) {
    const toast = document.getElementById('notificationToast');
    const toastIcon = document.getElementById('notificationIcon');
    const toastTitle = document.getElementById('notificationTitle');
    const toastMessage = document.getElementById('notificationMessage');
    
    // Set icon and colors based on type
    let iconClass = '';
    let headerClass = '';
    
    switch(type) {
        case 'success':
            iconClass = 'bi-check-circle-fill text-success';
            headerClass = 'bg-success text-white';
            title = title || 'Success';
            break;
        case 'error':
        case 'danger':
            iconClass = 'bi-x-circle-fill text-danger';
            headerClass = 'bg-danger text-white';
            title = title || 'Error';
            break;
        case 'warning':
            iconClass = 'bi-exclamation-triangle-fill text-warning';
            headerClass = 'bg-warning text-dark';
            title = title || 'Warning';
            break;
        case 'info':
        default:
            iconClass = 'bi-info-circle-fill text-info';
            headerClass = 'bg-info text-white';
            title = title || 'Information';
            break;
    }
    
    // Update toast content
    toastIcon.className = `bi me-2 ${iconClass}`;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Update header class
    const toastHeader = toast.querySelector('.toast-header');
    toastHeader.className = `toast-header ${headerClass}`;
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 4000
    });
    bsToast.show();
}

// Confirmation dialog
function showConfirm(message, title = 'Confirm', onConfirm = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('confirmModalTitle');
        const modalBody = document.getElementById('confirmModalBody');
        const modalHeader = document.getElementById('confirmModalHeader');
        const confirmBtn = document.getElementById('confirmModalBtn');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = message;
        modalHeader.className = 'modal-header bg-primary text-white';
        
        // Remove previous event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new event listener
        newConfirmBtn.addEventListener('click', () => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
            if (onConfirm) {
                onConfirm();
            }
            resolve(true);
        });
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Handle cancel
        modal.addEventListener('hidden.bs.modal', function onHidden() {
            modal.removeEventListener('hidden.bs.modal', onHidden);
            resolve(false);
        }, { once: true });
    });
}


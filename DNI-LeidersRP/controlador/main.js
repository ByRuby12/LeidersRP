import { saveData } from "../firebase/firebase.js";

let usuarioEnviado = localStorage.getItem('usuarioEnviado') === 'true';

// Función para mostrar notificaciones personalizadas
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar la notificación
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Eliminar después del tiempo especificado
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Función para validar campos del formulario
function validateFormField(field) {
    const value = field.value.trim();
    
    if (!value && field.hasAttribute('required')) {
        field.classList.add('error');
        return false;
    }

    field.classList.remove('error');
    return true;
}

// Función para mostrar el formulario modal
function showDNIForm() {
    // Verificar si ya se ha creado el usuario
    if (usuarioEnviado) {
        showNotification('El usuario ya ha sido creado. No puedes crear otro.', 'warning');
        return;
    }

    const modalContainer = document.getElementById('modalContainer');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-id-card"></i> Crear Nuevo DNI</h2>
            </div>

            <form id="dniForm" class="dni-form">
                <div class="form-sections">
                    <div class="form-section">
                        <h3><i class="fas fa-user"></i> Identificación</h3>
                        
                        <div class="form-group">
                            <label for="psid">ID de PlayStation <span class="required">*</span></label>
                            <input type="text" id="psid" name="psid" placeholder="TuUserPS4" required class="form-input">
                            <span class="form-hint">Tu nombre de usuario de PlayStation</span>
                        </div>

                        <div class="form-group">
                            <label for="discord">Discord ID <span class="required">*</span></label>
                            <input type="text" id="discord" name="discord" placeholder="ByRuby12" required class="form-input">
                            <span class="form-hint">Tu nombre de usuario de Discord</span>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3><i class="fas fa-address-card"></i> Datos Personales</h3>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="nombre">Nombre <span class="required">*</span></label>
                                <input type="text" id="nombre" name="nombre" placeholder="Toronto" required class="form-input">
                            </div>

                            <div class="form-group">
                                <label for="apellido">Apellido <span class="required">*</span></label>
                                <input type="text" id="apellido" name="apellido" placeholder="Cano" required class="form-input">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="sexo">Sexo <span class="required">*</span></label>
                                <select id="sexo" name="sexo" required class="form-input">
                                    <option value="">-- Selecciona --</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="nacionalidad">Nacionalidad <span class="required">*</span></label>
                                <input type="text" id="nacionalidad" name="nacionalidad" placeholder="Española" required class="form-input">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="fechanac">Fecha de Nacimiento <span class="required">*</span></label>
                            <input type="date" id="fechanac" name="fechanac" required class="form-input">
                            <span class="form-hint">Selecciona tu fecha de nacimiento</span>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3><i class="fas fa-briefcase"></i> Información Laboral</h3>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="trabajo">Trabajo <span class="required">*</span></label>
                                <input type="text" id="trabajo" name="trabajo" placeholder="Policía" required class="form-input">
                            </div>

                            <div class="form-group">
                                <label for="rango">Rango <span class="required">*</span></label>
                                <input type="text" id="rango" name="rango" placeholder="Superintendente" required class="form-input">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <button type="button" class="btn-cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="submit" class="btn-submit">
                        <i class="fas fa-check"></i> Crear DNI
                    </button>
                </div>
            </form>
        </div>
    `;

    modalContainer.appendChild(modal);

    // Event listeners
    const cancelBtn = modal.querySelector('.btn-cancel');
    const form = modal.querySelector('#dniForm');

    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    form.addEventListener('submit', addNewData);
}

// Función para agregar nuevos datos al usuario
async function addNewData(e) {
    e.preventDefault();

    const form = e.target;
    const inputs = form.querySelectorAll('[required]');
    let formValid = true;

    // Validar todos los campos
    inputs.forEach(input => {
        if (!validateFormField(input)) {
            formValid = false;
        }
    });

    if (!formValid) {
        showNotification('Por favor completa todos los campos correctamente', 'error', 4000);
        return;
    }

    // Recopilar datos del formulario
    const psid = document.getElementById('psid').value.trim();
    const discord = document.getElementById('discord').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const sexo = document.getElementById('sexo').value.trim();
    const nacionalidad = document.getElementById('nacionalidad').value.trim();
    const fechanac = document.getElementById('fechanac').value.trim();
    const trabajo = document.getElementById('trabajo').value.trim();
    const rango = document.getElementById('rango').value.trim();

    const newZone = {
        name: psid,
        datos: {
            Discord: discord,
            Nombre: nombre,
            Apellido: apellido,
            Sexo: sexo,
            Nacionalidad: nacionalidad,
            FechaNac: fechanac,
            Trabajo: trabajo,
            Rango: rango
        },
        executors: {
            'BuscaYCaptura': false
        }
    };

    try {
        await saveData('zones', newZone);
        
        // Mostrar notificación de éxito
        showNotification('¡Usuario y datos agregados correctamente!', 'success', 3000);
        
        // Actualizar estado
        usuarioEnviado = true;
        localStorage.setItem('usuarioEnviado', 'true');
        document.getElementById('addZoneBtn').disabled = true;
        
        // Cerrar el modal después de un tiempo
        const modal = form.closest('.modal-overlay');
        setTimeout(() => {
            if (modal) modal.remove();
        }, 1500);
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showNotification('Hubo un error al guardar los datos. Intenta nuevamente.', 'error', 4000);
    }
}

// Evento cuando el DOM se ha cargado
document.addEventListener('DOMContentLoaded', () => {
    const addZoneBtn = document.getElementById('addZoneBtn');
    
    addZoneBtn.addEventListener('click', showDNIForm);

    if (usuarioEnviado) {
        addZoneBtn.disabled = true;
    }
});

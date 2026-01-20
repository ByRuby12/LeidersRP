export function showDNIForm(onSubmit) {
    const modalContainer = document.getElementById('modalContainer');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-id-card"></i> Crear Nuevo DNI</h2>
                <button class="close-btn" type="button">
                    <i class="fas fa-times"></i>
                </button>
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
                            <input type="text" id="fechanac" name="fechanac" placeholder="15/05/1990" required class="form-input">
                            <span class="form-hint">Formato: DD/MM/YYYY</span>
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

    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const form = modal.querySelector('#dniForm');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('psid').value.trim(),
            datos: {
                Discord: document.getElementById('discord').value.trim(),
                Nombre: document.getElementById('nombre').value.trim(),
                Apellido: document.getElementById('apellido').value.trim(),
                Sexo: document.getElementById('sexo').value.trim(),
                Nacionalidad: document.getElementById('nacionalidad').value.trim(),
                FechaNac: document.getElementById('fechanac').value.trim(),
                Trabajo: document.getElementById('trabajo').value.trim(),
                Rango: document.getElementById('rango').value.trim()
            }
        };

        await onSubmit(formData);
        closeModal();
    });
}

// Validación de formulario en tiempo real
export function validateFormField(input) {
    const value = input.value.trim();
    
    if (input.hasAttribute('required') && !value) {
        input.classList.add('error');
        return false;
    }

    if (input.id === 'fechanac') {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dateRegex.test(value)) {
            input.classList.add('error');
            return false;
        }
    }

    input.classList.remove('error');
    return true;
}

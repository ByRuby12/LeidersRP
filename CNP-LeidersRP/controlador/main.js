import { getDataCollection, updateData } from "../firebase/firebase.js";
import { multas } from './multas.js';
import { showFormModal, showSuccessNotification, showErrorNotification } from './formUtils.js';

// Variables globales
let isLoggedIn = false;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos

document.addEventListener('DOMContentLoaded', async () => {
    checkLoginStatus();
});

function checkLoginStatus() {
    const loginSession = sessionStorage.getItem('cnp_login');
    const lockoutTime = sessionStorage.getItem('cnp_lockout');
    
    if (lockoutTime && Date.now() < parseInt(lockoutTime)) {
        showLockoutScreen();
        return;
    }
    
    if (loginSession === 'true') {
        isLoggedIn = true;
        showMainContent();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    const container = document.querySelector('.container');
    
    container.innerHTML = `
        <div class="login-overlay">
            <div class="login-card">
                <div class="login-logo">👮</div>
                <h1 class="login-title">ACCESO PDA</h1>
                <p class="login-subtitle">Sistema Policial Leiders RP</p>

                <form id="loginForm">
                    <div class="login-form-group">
                        <label>👤 Usuario</label>
                        <input 
                            type="text" 
                            id="loginUsername" 
                            placeholder="Ingresa tu usuario..." 
                            required
                        >
                    </div>

                    <div class="login-form-group login-password-wrapper">
                        <label>🔐 Contraseña</label>
                        <input 
                            type="password" 
                            id="loginPassword" 
                            placeholder="Ingresa tu contraseña..." 
                            required
                        >
                        <button type="button" id="togglePassword">👁️</button>
                    </div>

                    <div id="loginError"></div>
                    <div id="attemptsCounter"></div>
                    <button type="submit" id="loginBtn">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    `;

    setupLoginListeners();
}

function setupLoginListeners() {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');

    // Toggle mostrar/ocultar contraseña
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Enviar formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(usernameInput.value, passwordInput.value, loginBtn);
    });

    // Permitir Enter en contraseña
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });

    usernameInput.focus();
    updateAttemptsDisplay();
}

function handleLogin(username, password, loginBtn) {
    const attempts = parseInt(sessionStorage.getItem('cnp_attempts') || '0');
    const errorElement = document.getElementById('loginError');

    // Validar credenciales
    if (username.trim() === 'CNP' && password === 'manolete') {
        // Login exitoso
        loginBtn.style.opacity = '0.6';
        loginBtn.disabled = true;
        loginBtn.textContent = '⏳ Iniciando...';

        setTimeout(() => {
            sessionStorage.setItem('cnp_login', 'true');
            sessionStorage.removeItem('cnp_attempts');
            sessionStorage.removeItem('cnp_lockout');
            isLoggedIn = true;
            showMainContent();
        }, 800);
    } else {
        // Login fallido
        const newAttempts = attempts + 1;
        sessionStorage.setItem('cnp_attempts', newAttempts.toString());

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockout = Date.now() + LOCKOUT_TIME;
            sessionStorage.setItem('cnp_lockout', lockout.toString());
            showLockoutScreen();
        } else {
            errorElement.textContent = `❌ Usuario o contraseña incorrectos. Intentos restantes: ${MAX_LOGIN_ATTEMPTS - newAttempts}`;
            errorElement.classList.add('show');
            updateAttemptsDisplay();
            document.getElementById('loginPassword').value = '';
        }
    }
}

function updateAttemptsDisplay() {
    const attempts = parseInt(sessionStorage.getItem('cnp_attempts') || '0');
    const counterElement = document.getElementById('attemptsCounter');
    
    if (counterElement && attempts > 0) {
        counterElement.textContent = `Intentos fallidos: ${attempts}/${MAX_LOGIN_ATTEMPTS}`;
        counterElement.classList.add('show');
    }
}

function showLockoutScreen() {
    const lockoutTime = parseInt(sessionStorage.getItem('cnp_lockout'));
    const now = Date.now();
    const remaining = Math.ceil((lockoutTime - now) / 1000);

    const container = document.querySelector('.container');
    
    container.innerHTML = `
        <div class="login-overlay">
            <div class="lockout-card">
                <div class="lockout-logo">🔒</div>
                <h1 class="lockout-title">Acceso Bloqueado</h1>
                <p class="lockout-message">Demasiados intentos fallidos. Intenta de nuevo en:</p>
                <div id="lockoutTimer">${remaining}s</div>
                <p class="lockout-warning">Por seguridad, tu acceso ha sido temporalmente bloqueado.</p>
            </div>
        </div>
    `;

    const timer = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutTime) {
            clearInterval(timer);
            sessionStorage.removeItem('cnp_lockout');
            sessionStorage.removeItem('cnp_attempts');
            checkLoginStatus();
        } else {
            const newRemaining = Math.ceil((lockoutTime - now) / 1000);
            const timerElement = document.getElementById('lockoutTimer');
            if (timerElement) {
                timerElement.textContent = newRemaining + 's';
            }
        }
    }, 1000);
}

function showMainContent() {
    const container = document.querySelector('.container');
    
    // Restaurar el HTML del panel PDA
    container.innerHTML = `
        <header class="header">
            <h1>👮 PDA POLICIAL - LEIDERS RP</h1>
        </header>

        <div class="search-container">
            <input 
                type="text" 
                id="searchInputUser" 
                placeholder="🔍 Buscar por nombre de usuario..." 
                class="search-input"
                autocomplete="off"
            >
        </div>

        <div id="zonesContainer" class="zones-container"></div>
    `;

    // Agregar event listeners
    const searchInput = document.getElementById('searchInputUser');
    if (searchInput) {
        searchInput.addEventListener('input', async () => {
            await loadZones();
        });
    }
}

async function loadZones() {
    const searchInput = document.getElementById('searchInputUser');
    const zonesContainer = document.getElementById('zonesContainer');
    const searchInputValue = searchInput.value.trim().toLowerCase();

    if (!searchInputValue) {
        zonesContainer.innerHTML = '';
        return;
    }

    const zonesSnapshot = await getDataCollection('zones');
    zonesContainer.innerHTML = '';

    zonesSnapshot.forEach((zoneDoc) => {
        const zoneData = zoneDoc.data();
        const zoneId = zoneDoc.id;
        if (zoneData.name && typeof zoneData.name === 'string' && zoneData.name.trim().toLowerCase().includes(searchInputValue)) {
            const zoneElement = document.createElement('div');
            zoneElement.classList.add('zone');
            const zoneHeader = document.createElement('div');
            zoneHeader.classList.add('zone-header');
            zoneHeader.innerHTML = `<p class="zone-name">PlayStation: ${zoneData.name}</p><img src="./img/user.png" class="edit-zone-btn">`;
            zoneElement.appendChild(zoneHeader);

/*------------------------------------------------------------------------------------*/

        const dataContainer = document.createElement('div');
        dataContainer.classList.add('data-container');
        
        // Verificar si zoneData tiene una propiedad datos
        if (zoneData && zoneData.datos) {
            const data = zoneData.datos;
            const orderedFields = [
                'Discord',
                'Nombre',
                'Apellido',
                'Sexo',
                'Nacionalidad',
                'FechaNac',
                'Trabajo',
                'Rango'
            ];
        
            // Crear filas de datos
            for (let i = 0; i < orderedFields.length; i += 2) {
                const rowData = document.createElement('div');
                rowData.classList.add('data-row');
        
                // Crear elementos de datos para cada fila
                for (let j = i; j < i + 2 && j < orderedFields.length; j++) {
                    const field = orderedFields[j];
                    const fieldValue = data[field];
                    const dataFieldElement = document.createElement('div');
                    dataFieldElement.classList.add('data-element');
                    
                    // Crear estructura mejorada
                    const fieldLabel = document.createElement('strong');
                    fieldLabel.textContent = field;
                    
                    const fieldValueSpan = document.createElement('span');
                    fieldValueSpan.textContent = fieldValue || 'N/A';
                    
                    dataFieldElement.appendChild(fieldLabel);
                    dataFieldElement.appendChild(fieldValueSpan);
                    rowData.appendChild(dataFieldElement);
                }
        
                dataContainer.appendChild(rowData);
            }
        } else {
            // En caso de que zoneData o zoneData.datos sean undefined
            const noDataElement = document.createElement('div');
            noDataElement.classList.add('data-element');
            noDataElement.textContent = 'Sin datos disponibles';
            dataContainer.appendChild(noDataElement);
        }
        
        zoneElement.appendChild(dataContainer);
        
/*------------------------------------------------------------------------------------*/
        // Contenedor para busca y captura
        const executorsContainer = document.createElement('div');
        executorsContainer.classList.add('executors-container');    

        for (const executor in zoneData.executors) {
            const executorContainer = document.createElement('div');
            executorContainer.id = `executor-${executor}`;
            executorContainer.classList.add('executor-container');

            const executorState = zoneData.executors[executor];
            executorContainer.innerHTML = `
                <div class="panel-${executorState ? 'si' : 'no'}">
                    <div class="panel-text">${executorState ? 'ACTIVO - En busca y captura en la ciudad' : 'INACTIVO - No buscado'} </div>
                </div>
            `;

            executorsContainer.appendChild(executorContainer);
        }

        zoneElement.appendChild(executorsContainer);

/*------------------------------------------------------------------------------------*/
        // Contenedor para notas
        const notesContainer = document.createElement('div');
        notesContainer.classList.add('notes-container');

        const notesTitle = document.createElement('h2');

        notesTitle.textContent = `NOTAS:`;
        notesContainer.appendChild(notesTitle);

        const numberOfNotes = zoneData.notas ? Object.keys(zoneData.notas).length : 0;

        for (const noteId in zoneData.notas) {
            const noteContainer = document.createElement('div');
            noteContainer.classList.add('note-container');
            noteContainer.innerHTML = `
                <p><b>Nota ${noteId}:</b> ${zoneData.notas[noteId]}</p>
                <button onclick="updateNote('${zoneId}', '${noteId}')" class="modify-note-btn">Modificar Nota</button>
            `;
            notesContainer.appendChild(noteContainer);
        }

        // Crear elemento para mostrar el total de notas en esta zona
        const totalNotesElement = document.createElement('div');
        totalNotesElement.textContent = `Total notas: ${numberOfNotes}`; 
        totalNotesElement.classList.add('total-fine-amount'); 

        const circleElementNotes = document.createElement('div');
        circleElementNotes.classList.add('circle', 'green');

        totalNotesElement.appendChild(circleElementNotes);
        notesContainer.appendChild(totalNotesElement);


        zoneElement.appendChild(notesContainer);

/*------------------------------------------------------------------------------------*/
        // Contenedor para multas
        const finesContainer = document.createElement('div');
        finesContainer.classList.add('fines-container');

        const finesTitle = document.createElement('h2');
        finesTitle.textContent = `MULTAS:`;
        finesContainer.appendChild(finesTitle);

        let totalFineAmountInZone = 0;

        for (const fineName in zoneData.multas) {
            const fineData = zoneData.multas[fineName];
            const fineContainer = document.createElement('div');
            fineContainer.classList.add('fine-container');

            const paidStatus = fineData.isPaid ? "Pagada" : "No Pagada";
            fineContainer.innerHTML = `
                <p><b>Multa ${fineName}:</b> ${fineData.description} <br> <b>Precio ➜</b> ${fineData.price}€ <br> <b>Estado ➜</b> ${paidStatus}</p>
                <button onclick="updateFine('${zoneId}', '${fineName}')" class="modify-fine-btn">Modificar Descripcion</button>
                <button onclick="updateFineStatus('${zoneId}', '${fineName}')" class="modify-fine-btn">Modificar Estado Multa</button>
            `;

            finesContainer.appendChild(fineContainer);

            if (!fineData.isPaid) { // Solo contamos las multas no pagadas
                totalFineAmountInZone += fineData.price;
            }
        }

        // Mostrar el total de dinero de las multas en esta zona
        const totalFineAmountInZoneElement = document.createElement('div');
        totalFineAmountInZoneElement.textContent = `Total dinero de multas: ${totalFineAmountInZone}€`;
        totalFineAmountInZoneElement.classList.add('total-fine-amount');

        const circleElementMultas = document.createElement('div');
        circleElementMultas.classList.add('circle');

        if (totalFineAmountInZone > 50000) {
            circleElementMultas.classList.add('red');
        } else {
            circleElementMultas.classList.add('green');
        }

        totalFineAmountInZoneElement.appendChild(circleElementMultas);
        finesContainer.appendChild(totalFineAmountInZoneElement);

        zoneElement.appendChild(finesContainer);

/*------------------------------------------------------------------------------------*/
        // Contenedor para denuncias
        const complaintsContainer = document.createElement('div');
        complaintsContainer.classList.add('complaints-container');

        const complaintTitle = document.createElement('h2');
        complaintTitle.textContent = `DENUNCIAS:`;
        complaintsContainer.appendChild(complaintTitle);  

        const numberOfComplaints = zoneData.denuncias ? Object.keys(zoneData.denuncias).length : 0;

        for (const complaintName in zoneData.denuncias) {
            const complaintContainer = document.createElement('div');
            complaintContainer.classList.add('complaint-container');

            complaintContainer.innerHTML = `
                <p><b>Denuncia ${complaintName}:</b> ${zoneData.denuncias[complaintName]} </p>
                <button onclick="updateComplaint('${zoneId}', '${complaintName}')" class="modify-complaint-btn">Modificar Denuncia</button>
            `;

            complaintsContainer.appendChild(complaintContainer);
        }

        // Agregar el círculo indicador de cantidad de denuncias
        const totalComplaintsElement = document.createElement('div');
        totalComplaintsElement.textContent = `Total de denuncias: ${numberOfComplaints}`;
        totalComplaintsElement.classList.add('total-fine-amount');        

        const circleElementDenuncias = document.createElement('div');
        circleElementDenuncias.classList.add('circle');

        if (numberOfComplaints >= 20) {
            circleElementDenuncias.classList.add('red');
        } else {
            circleElementDenuncias.classList.add('green');
        }

        totalComplaintsElement.appendChild(circleElementDenuncias);
        complaintsContainer.appendChild(totalComplaintsElement);

        zoneElement.appendChild(complaintsContainer);


        /*------------------------------------------------------------------------------------*/
        
        // Contenedor para botones
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons-container');

        // Botón para agregar nueva nota
        const addNoteButton = document.createElement('button');
        addNoteButton.textContent = 'Crear Nota';
        addNoteButton.onclick = () => addNewNote(zoneId);
        addNoteButton.classList.add('add-note-btn');
        buttonsContainer.appendChild(addNoteButton);        

        // Botón para agregar nuevas multas
        const addFineButton = document.createElement('button');
        addFineButton.textContent = 'Crear Multa';
        addFineButton.onclick = () => addNewFine(zoneId);
        addFineButton.classList.add('add-fine-btn');
        buttonsContainer.appendChild(addFineButton);

        // Botón para agregar nuevas denuncias
        const addComplaintButton = document.createElement('button');
        addComplaintButton.textContent = 'Crear Denuncia';
        addComplaintButton.onclick = () => addNewComplaint(zoneId);
        addComplaintButton.classList.add('add-complaint-btn');
        buttonsContainer.appendChild(addComplaintButton);

        // Botón para agregar nuevos ejecutores
        const addExecutorButton = document.createElement('button');
        addExecutorButton.textContent = 'Busca y Captura';
        addExecutorButton.onclick = () => addNewExecutor(zoneId);
        addExecutorButton.classList.add('add-executor-btn');
        buttonsContainer.appendChild(addExecutorButton);

        zoneElement.appendChild(buttonsContainer);

        /*------------------------------------------------------------------------------------*/

        zonesContainer.appendChild(zoneElement);
    }
    });
}

// Función auxiliar para obtener el siguiente número disponible
function getNextAvailableNumber(items) {
    if (!items || Object.keys(items).length === 0) return '1';
    
    const numbers = Object.keys(items)
        .map(key => parseInt(key))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
    
    for (let i = 1; i <= numbers.length + 1; i++) {
        if (!numbers.includes(i)) {
            return i.toString();
        }
    }
    
    return (numbers.length + 1).toString();
}

/*-----------------------------BUSCA Y CAPTURA------------------------------------*/

window.addNewExecutor = async function (zoneId) {
    // Obtener datos actuales del executor
    const zonesSnapshot = await getDataCollection('zones');
    let currentExecutorState = false;

    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId) {
            const zoneData = zoneDoc.data();
            if (zoneData.executors && zoneData.executors.BuscaYCaptura !== undefined) {
                currentExecutorState = zoneData.executors.BuscaYCaptura;
            }
        }
    });

    showFormModal(
        'GESTIONAR BUSCA Y CAPTURA',
        [
            { 
                name: 'executorState', 
                label: 'Estado de Busca y Captura', 
                type: 'select', 
                required: true,
                value: currentExecutorState.toString(),
                options: [
                    { value: 'false', label: 'INACTIVO - No buscado' },
                    { value: 'true', label: 'ACTIVO - En busca y captura en la ciudad' }
                ]
            }
        ],
        async (data) => {
            try {
                const executorState = data.executorState === 'true';
                const updatedData = {
                    'executors.BuscaYCaptura': executorState,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Estado actualizado: ${executorState ? 'ACTIVO' : 'INACTIVO'}`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al actualizar busca y captura');
                console.error(error);
            }
        }
    );
}

/*-----------------------------NOTAS------------------------------------*/

window.addNewNote = async function (zoneId) {
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().notas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().notas);
        }
    });

    showFormModal(
        `CREAR NUEVA NOTA #${nextNumber}`,
        [
            { 
                name: 'noteDescription', 
                label: 'Descripción', 
                type: 'textarea', 
                required: true, 
                placeholder: 'Describe el contenido de la nota...' 
            }
        ],
        async (data) => {
            try {
                const updatedData = {
                    [`notas.${nextNumber}`]: data.noteDescription,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Nota #${nextNumber} creada correctamente`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al crear la nota');
                console.error(error);
            }
        }
    );
}

window.updateNote = async function (zoneId, noteId) {
    // Obtener datos actuales de la nota
    const zonesSnapshot = await getDataCollection('zones');
    let currentNoteData = null;

    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId) {
            const zoneData = zoneDoc.data();
            if (zoneData.notas && zoneData.notas[noteId]) {
                currentNoteData = zoneData.notas[noteId];
            }
        }
    });

    if (!currentNoteData) {
        showErrorNotification('✗ No se encontraron los datos de la nota');
        return;
    }

    showFormModal(
        `MODIFICAR NOTA #${noteId}`,
        [
            { 
                name: 'noteDescription', 
                label: 'Nueva Descripción', 
                type: 'textarea', 
                required: true, 
                placeholder: 'Actualiza el contenido de la nota...',
                value: currentNoteData
            }
        ],
        async (data) => {
            try {
                const updatedData = {
                    [`notas.${noteId}`]: data.noteDescription,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Nota #${noteId} actualizada correctamente`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al actualizar la nota');
                console.error(error);
            }
        }
    );
}

/*-----------------------------MULTAS------------------------------------*/

window.addNewFine = async function (zoneId) {
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().multas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().multas);
        }
    });

    showFormModal(
        `CREAR NUEVA MULTA #${nextNumber}`,
        [
            { 
                name: 'fineCalculator', 
                label: '🔍 Buscar y Calcular Multas (Opcional)', 
                type: 'fine-calculator', 
                required: false,
                multas: multas
            },
            { 
                name: 'fineDescription', 
                label: 'Descripción', 
                type: 'textarea', 
                required: true, 
                placeholder: 'Describe la infracción...' 
            },
            { 
                name: 'finePrice', 
                label: 'Precio en € (o usa el calculador de arriba)', 
                type: 'number', 
                required: true, 
                placeholder: '500' 
            }
        ],
        async (data) => {
            try {
                let price = parseFloat(data.finePrice) || 0;
                
                // Si hay precio calculado, usarlo
                if (data.calculatedPrice && data.calculatedPrice > 0) {
                    price = data.calculatedPrice;
                }
                
                if (price < 0) {
                    showErrorNotification('✗ El precio no puede ser negativo');
                    return;
                }

                const updatedData = {
                    [`multas.${nextNumber}`]: {
                        description: data.fineDescription,
                        price: price,
                        isPaid: false
                    }
                };

                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Multa #${nextNumber} creada correctamente - Total: ${price}€`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al crear la multa');
                console.error(error);
            }
        }
    );
}

window.updateFine = async function (zoneId, fineId) {
    // Obtener datos actuales de la multa
    const zonesSnapshot = await getDataCollection('zones');
    let currentFineData = null;

    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId) {
            const zoneData = zoneDoc.data();
            if (zoneData.multas && zoneData.multas[fineId]) {
                currentFineData = zoneData.multas[fineId];
            }
        }
    });

    if (!currentFineData) {
        showErrorNotification('✗ No se encontraron los datos de la multa');
        return;
    }

    showFormModal(
        `MODIFICAR MULTA #${fineId}`,
        [
            { 
                name: 'fineDescription', 
                label: 'Descripción', 
                type: 'textarea', 
                required: true, 
                placeholder: 'Actualiza la descripción...',
                value: currentFineData.description
            },
            { 
                name: 'finePrice', 
                label: 'Cantidad en €', 
                type: 'number', 
                required: true, 
                placeholder: '500',
                value: currentFineData.price
            }
        ],
        async (data) => {
            try {
                const price = parseFloat(data.finePrice);
                if (price < 0) {
                    showErrorNotification('✗ El precio no puede ser negativo');
                    return;
                }

                const updatedData = {
                    [`multas.${fineId}.description`]: data.fineDescription,
                    [`multas.${fineId}.price`]: price,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Multa #${fineId} actualizada correctamente`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al actualizar la multa');
                console.error(error);
            }
        }
    );
}

window.updateFineStatus = async function(zoneId, fineId) {
    showFormModal(
        `CAMBIAR ESTADO - MULTA #${fineId}`,
        [
            { 
                name: 'isPaid', 
                label: 'Estado de la Multa', 
                type: 'select', 
                required: true,
                options: [
                    { value: 'false', label: '❌ No Pagada' },
                    { value: 'true', label: '✓ Pagada' }
                ]
            }
        ],
        async (data) => {
            try {
                const isPaid = data.isPaid === 'true';
                const updatedData = {
                    [`multas.${fineId}.isPaid`]: isPaid,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Multa #${fineId} marcada como ${isPaid ? 'PAGADA' : 'NO PAGADA'}`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al actualizar estado de multa');
                console.error(error);
            }
        }
    );
}

/*-----------------------------DENUNCIAS------------------------------------*/

window.addNewComplaint = async function (zoneId) {
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().denuncias) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().denuncias);
        }
    });

    showFormModal(
        `CREAR NUEVA DENUNCIA #${nextNumber}`,
        [
            { 
                name: 'complaintDescription', 
                label: 'Descripción', 
                type: 'textarea', 
                required: true, 
                placeholder: 'Describe la denuncia...' 
            }
        ],
        async (data) => {
            try {
                const updatedData = {
                    [`denuncias.${nextNumber}`]: data.complaintDescription,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Denuncia #${nextNumber} creada correctamente`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al crear la denuncia');
                console.error(error);
            }
        }
    );
}

window.updateComplaint = async function (zoneId, complaintId) {
    // Obtener datos actuales de la denuncia
    const zonesSnapshot = await getDataCollection('zones');
    let currentComplaintData = null;

    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId) {
            const zoneData = zoneDoc.data();
            if (zoneData.denuncias && zoneData.denuncias[complaintId]) {
                currentComplaintData = zoneData.denuncias[complaintId];
            }
        }
    });

    if (!currentComplaintData) {
        showErrorNotification('✗ No se encontraron los datos de la denuncia');
        return;
    }

    showFormModal(
        `MODIFICAR DENUNCIA #${complaintId}`,
        [
            { 
                name: 'complaintDescription', 
                label: 'Nueva Descripción', 
                type: 'textarea', 
                required: true, 
                placeholder: 'Actualiza la descripción...',
                value: currentComplaintData
            }
        ],
        async (data) => {
            try {
                const updatedData = {
                    [`denuncias.${complaintId}`]: data.complaintDescription,
                };
                await updateData(zoneId, 'zones', updatedData);
                showSuccessNotification(`✓ Denuncia #${complaintId} actualizada correctamente`);
                loadZones();
            } catch (error) {
                showErrorNotification('✗ Error al actualizar la denuncia');
                console.error(error);
            }
        }
    );
}
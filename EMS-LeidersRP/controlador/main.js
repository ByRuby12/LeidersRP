import { getDataCollection, updateData } from "../firebase/firebase.js";

document.addEventListener('DOMContentLoaded', async () => {
    checkLoginStatus();
});

// Variables globales
let isLoggedIn = false;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos

function checkLoginStatus() {
    const loginSession = sessionStorage.getItem('ems_login');
    const lockoutTime = sessionStorage.getItem('ems_lockout');
    
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
                <div class="login-logo">🚑</div>
                <h1 class="login-title">ACCESO PDA EMS</h1>
                <p class="login-subtitle">Sistema de Gestión Médica Leiders RP</p>

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
    const attempts = parseInt(sessionStorage.getItem('ems_attempts') || '0');
    const errorElement = document.getElementById('loginError');

    // Validar credenciales
    if (username.trim() === 'EMS' && password === 'SuperMan') {
        // Login exitoso
        loginBtn.style.opacity = '0.6';
        loginBtn.disabled = true;
        loginBtn.textContent = '⏳ Iniciando...';

        setTimeout(() => {
            sessionStorage.setItem('ems_login', 'true');
            sessionStorage.removeItem('ems_attempts');
            sessionStorage.removeItem('ems_lockout');
            isLoggedIn = true;
            showMainContent();
        }, 800);
    } else {
        // Login fallido
        const newAttempts = attempts + 1;
        sessionStorage.setItem('ems_attempts', newAttempts.toString());

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockout = Date.now() + LOCKOUT_TIME;
            sessionStorage.setItem('ems_lockout', lockout.toString());
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
    const attempts = parseInt(sessionStorage.getItem('ems_attempts') || '0');
    const counterElement = document.getElementById('attemptsCounter');
    
    if (counterElement && attempts > 0) {
        counterElement.textContent = `Intentos fallidos: ${attempts}/${MAX_LOGIN_ATTEMPTS}`;
        counterElement.classList.add('show');
    }
}

function showLockoutScreen() {
    const lockoutTime = parseInt(sessionStorage.getItem('ems_lockout'));
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
            sessionStorage.removeItem('ems_lockout');
            sessionStorage.removeItem('ems_attempts');
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
    
    // Restaurar el HTML original
    container.innerHTML = `
        <h1>🚑 PDA EMS - LEIDERS RP</h1>

        <div class="search-container">
            <input 
                type="text" 
                id="searchInputUser" 
                placeholder="🔍 Buscar paciente por nombre..." 
                class="search-input"
                autocomplete="off"
            >
        </div>

        <div id="zonesContainer" class="zones-container"></div>
    `;

    // Agregar event listener al input de búsqueda
    const searchInput = document.getElementById('searchInputUser');
    if (searchInput) {
        searchInput.addEventListener('input', async () => {
            await loadZones();
        });
        searchInput.focus();
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

window.openModal = openModal;
window.closeModal = closeModal;

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

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

            // ===== DATOS =====
            const dataContainer = document.createElement('div');
            dataContainer.classList.add('data-container');
            
            if (zoneData && zoneData.datos) {
                const data = zoneData.datos;
                const orderedFields = ['Discord', 'Nombre', 'Apellido', 'Sexo', 'Nacionalidad', 'FechaNac', 'Trabajo', 'Rango'];
            
                for (let i = 0; i < orderedFields.length; i += 2) {
                    const rowData = document.createElement('div');
                    rowData.classList.add('data-row');
            
                    for (let j = i; j < i + 2 && j < orderedFields.length; j++) {
                        const field = orderedFields[j];
                        const fieldValue = data[field];
                        const dataFieldElement = document.createElement('div');
                        dataFieldElement.classList.add('data-element');
                        
                        // Crear estructura igual a CNP
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
            }
            
            zoneElement.appendChild(dataContainer);

            // ===== NOTAS =====
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

            const totalNotesElement = document.createElement('div');
            totalNotesElement.textContent = `Total notas: ${numberOfNotes}`; 
            totalNotesElement.classList.add('total-fine-amount'); 

            const circleElementNotes = document.createElement('div');
            circleElementNotes.classList.add('circle', 'green');

            totalNotesElement.appendChild(circleElementNotes);
            notesContainer.appendChild(totalNotesElement);

            zoneElement.appendChild(notesContainer);

            // ===== CONSULTAS =====
            const consultsContainer = document.createElement('div');
            consultsContainer.classList.add('consults-container');

            const consultsTitle = document.createElement('h2');
            consultsTitle.textContent = `CONSULTAS MÉDICAS:`;
            consultsContainer.appendChild(consultsTitle);

            const numberOfConsults = zoneData.consultas ? Object.keys(zoneData.consultas).length : 0;

            for (const consultId in zoneData.consultas) {
                const consultContainer = document.createElement('div');
                consultContainer.classList.add('consult-container');
                consultContainer.innerHTML = `
                    <p><b>Consulta ${consultId}:</b> ${zoneData.consultas[consultId].details}</p>
                    <p><b>Atendido por:</b> ${zoneData.consultas[consultId].attendedBy}</p>
                    <button onclick="updateConsult('${zoneId}', '${consultId}')" class="modify-consult-btn">Modificar Consulta</button>
                `;
                consultsContainer.appendChild(consultContainer);
            }

            const totalConsultsElement = document.createElement('div');
            totalConsultsElement.textContent = `Total consultas: ${numberOfConsults}`; 
            totalConsultsElement.classList.add('total-fine-amount'); 

            const circleElementConsults = document.createElement('div');
            circleElementConsults.classList.add('circle', 'green');

            totalConsultsElement.appendChild(circleElementConsults);
            consultsContainer.appendChild(totalConsultsElement);

            zoneElement.appendChild(consultsContainer);

            // ===== OPERACIONES =====
            const operationsContainer = document.createElement('div');
            operationsContainer.classList.add('operations-container');

            const operationsTitle = document.createElement('h2');
            operationsTitle.textContent = `OPERACIONES MÉDICAS:`;
            operationsContainer.appendChild(operationsTitle);

            const numberOfOperations = zoneData.operaciones ? Object.keys(zoneData.operaciones).length : 0;

            for (const operationId in zoneData.operaciones) {
                const operationContainer = document.createElement('div');
                operationContainer.classList.add('operation-container');
                operationContainer.innerHTML = `
                    <p><b>Operación ${operationId}:</b> ${zoneData.operaciones[operationId].details}</p>
                    <p><b>Atendido por:</b> ${zoneData.operaciones[operationId].attendedBy}</p>
                    <button onclick="updateOperation('${zoneId}', '${operationId}')" class="modify-operation-btn">Modificar Operación</button>
                `;
                operationsContainer.appendChild(operationContainer);
            }

            const totalOperationsElement = document.createElement('div');
            totalOperationsElement.textContent = `Total operaciones: ${numberOfOperations}`; 
            totalOperationsElement.classList.add('total-fine-amount'); 

            const circleElementOperations = document.createElement('div');
            circleElementOperations.classList.add('circle', 'green');

            totalOperationsElement.appendChild(circleElementOperations);
            operationsContainer.appendChild(totalOperationsElement);

            zoneElement.appendChild(operationsContainer);

            // ===== BOTONES =====
            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('buttons-container');

            const addNoteButton = document.createElement('button');
            addNoteButton.textContent = 'Crear Nota';
            addNoteButton.onclick = () => addNewNote(zoneId);
            addNoteButton.classList.add('add-note-btn');
            buttonsContainer.appendChild(addNoteButton);

            const addConsultButton = document.createElement('button');
            addConsultButton.textContent = 'Crear Consulta';
            addConsultButton.onclick = () => addNewConsult(zoneId);
            addConsultButton.classList.add('add-consult-btn');
            buttonsContainer.appendChild(addConsultButton);

            const addOperationButton = document.createElement('button');
            addOperationButton.textContent = 'Crear Operación';
            addOperationButton.onclick = () => addNewOperation(zoneId);
            addOperationButton.classList.add('add-operation-btn');
            buttonsContainer.appendChild(addOperationButton);

            zoneElement.appendChild(buttonsContainer);

            zonesContainer.appendChild(zoneElement);
        }
    });
}

let currentZoneId = null;
let currentItemId = null;

// ===== NOTAS =====
window.addNewNote = async function (zoneId) {
    currentZoneId = zoneId;
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().notas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().notas);
        }
    });
    
    currentItemId = nextNumber;
    document.getElementById('noteText').value = '';
    
    openModal('noteModal');
}

window.updateNote = async function (zoneId, noteId) {
    const zonesSnapshot = await getDataCollection('zones');
    let noteText = '';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().notas && zoneDoc.data().notas[noteId]) {
            noteText = zoneDoc.data().notas[noteId];
        }
    });
    
    currentZoneId = zoneId;
    currentItemId = noteId;
    
    document.getElementById('noteText').value = noteText;
    
    openModal('noteModal');
}

document.getElementById('noteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const noteText = document.getElementById('noteText').value;
    
    const updatedData = { [`notas.${currentItemId}`]: noteText };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('noteModal');
    loadZones();
});

// ===== CONSULTAS =====
window.addNewConsult = async function (zoneId) {
    currentZoneId = zoneId;
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().consultas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().consultas);
        }
    });
    
    currentItemId = nextNumber;
    document.getElementById('consultDetails').value = '';
    document.getElementById('consultAttended').value = '';
    
    openModal('consultModal');
}

window.updateConsult = async function (zoneId, consultId) {
    const zonesSnapshot = await getDataCollection('zones');
    let consultData = {};
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().consultas && zoneDoc.data().consultas[consultId]) {
            consultData = zoneDoc.data().consultas[consultId];
        }
    });
    
    currentZoneId = zoneId;
    currentItemId = consultId;
    
    document.getElementById('consultDetails').value = consultData.details || '';
    document.getElementById('consultAttended').value = consultData.attendedBy || '';
    
    openModal('consultModal');
}

document.getElementById('consultForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const consultDetails = document.getElementById('consultDetails').value;
    const consultAttended = document.getElementById('consultAttended').value;
    
    const updatedData = { [`consultas.${currentItemId}`]: { details: consultDetails, attendedBy: consultAttended } };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('consultModal');
    loadZones();
});

// ===== OPERACIONES =====
window.addNewOperation = async function (zoneId) {
    currentZoneId = zoneId;
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().operaciones) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().operaciones);
        }
    });
    
    currentItemId = nextNumber;
    document.getElementById('operationDetails').value = '';
    document.getElementById('operationAttended').value = '';
    
    openModal('operationModal');
}

window.updateOperation = async function (zoneId, operationId) {
    const zonesSnapshot = await getDataCollection('zones');
    let operationData = {};
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().operaciones && zoneDoc.data().operaciones[operationId]) {
            operationData = zoneDoc.data().operaciones[operationId];
        }
    });
    
    currentZoneId = zoneId;
    currentItemId = operationId;
    
    document.getElementById('operationDetails').value = operationData.details || '';
    document.getElementById('operationAttended').value = operationData.attendedBy || '';
    
    openModal('operationModal');
}

document.getElementById('operationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const operationDetails = document.getElementById('operationDetails').value;
    const operationAttended = document.getElementById('operationAttended').value;
    
    const updatedData = { [`operaciones.${currentItemId}`]: { details: operationDetails, attendedBy: operationAttended } };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('operationModal');
    loadZones();
});
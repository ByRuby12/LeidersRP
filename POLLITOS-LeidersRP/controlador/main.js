import { saveData, deleteData, getDataCollection, updateData, deleteField } from "../firebase/firebase.js";

const VALID_USERNAME = 'ADMIN';
const VALID_PASSWORD = 'Mondongo99';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

document.addEventListener('DOMContentLoaded', async () => {
    initializeLoginSystem();
});

function initializeLoginSystem() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const mainContent = document.getElementById('mainContent');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Verificar si hay sesión válida
    if (isSessionValid()) {
        showMainContent();
    } else {
        loginModal.classList.remove('hidden');
        loginForm.addEventListener('submit', handleLogin);
    }

    // Evento para cerrar sesión
    logoutBtn?.addEventListener('click', handleLogout);
}

function isSessionValid() {
    const storedCredentials = JSON.parse(localStorage.getItem('staffCredentials') || 'null');
    const expirationTime = localStorage.getItem('expirationTime');

    if (storedCredentials && expirationTime && Date.now() < parseInt(expirationTime)) {
        return true;
    }
    
    localStorage.removeItem('staffCredentials');
    localStorage.removeItem('expirationTime');
    return false;
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // Limpiar error previo
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';

    // Validar credenciales
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        const expiration = Date.now() + SESSION_DURATION;
        localStorage.setItem('staffCredentials', JSON.stringify({ username }));
        localStorage.setItem('expirationTime', expiration.toString());
        
        showMainContent();
        document.getElementById('loginForm').reset();
    } else {
        showError('Usuario o contraseña incorrectos');
    }
}

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('staffCredentials');
        localStorage.removeItem('expirationTime');
        location.reload();
    }
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function showMainContent() {
    const loginModal = document.getElementById('loginModal');
    const mainContent = document.getElementById('mainContent');
    
    loginModal.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    setupMainContent();
}

async function addNewZone() {
    // Limpiar el formulario
    document.getElementById('newUserPlayStation').value = '';
    document.getElementById('newUserNombre').value = '';
    document.getElementById('newUserApellido').value = '';
    document.getElementById('newUserDiscord').value = '';
    document.getElementById('newUserSexo').value = '';
    document.getElementById('newUserNacionalidad').value = '';
    document.getElementById('newUserFechaNac').value = '';
    document.getElementById('newUserTrabajo').value = '';
    document.getElementById('newUserRango').value = '';
    
    openModal('newUserModal');
}

async function loadZones() {
    const searchInput = document.getElementById('searchInput');
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
            const zoneElement = createZoneElement(zoneId, zoneData);
            zonesContainer.appendChild(zoneElement);
        }
    });
    
    loadStats();
}

function setupMainContent() {
    const searchInput = document.getElementById('searchInput');
    const addZoneBtn = document.getElementById('addZoneBtn');

    searchInput?.addEventListener('input', loadZones);
    addZoneBtn?.addEventListener('click', addNewZone);
    
    loadStats();
}

// Función para alternar estadísticas
window.toggleStats = function(section) {
    const statsContainer = document.getElementById('statsContainer');
    const topStatsContainer = document.getElementById('topStatsContainer');
    const buttons = document.querySelectorAll('.stats-toggle-btn');

    if (section === 'server') {
        statsContainer.classList.toggle('hidden');
        buttons[0].classList.toggle('active');
    } else if (section === 'ranking') {
        topStatsContainer.classList.toggle('hidden');
        buttons[1].classList.toggle('active');
    }
}

// Función para cargar y mostrar estadísticas
async function loadStats() {
    const zonesSnapshot = await getDataCollection('zones');
    const statsContainer = document.getElementById('statsContainer');
    const topStatsContainer = document.getElementById('topStatsContainer');
    
    let stats = {
        totalUsers: 0,
        totalFines: 0,
        totalFinesAmount: 0,
        totalComplaints: 0,
        totalNotes: 0,
        totalConsults: 0,
        totalOperations: 0,
        searchUsers: 0,
        usersWithoutData: 0
    };

    let topStats = {
        fines: { name: 'No hay usuarios', count: 0 },
        complaints: { name: 'No hay usuarios', count: 0 },
        notes: { name: 'No hay usuarios', count: 0 },
        consults: { name: 'No hay usuarios', count: 0 },
        operations: { name: 'No hay usuarios', count: 0 }
    };

    zonesSnapshot.forEach((zoneDoc) => {
        const zoneData = zoneDoc.data();
        stats.totalUsers++;

        // Contar multas y dinero total
        if (zoneData.multas) {
            Object.values(zoneData.multas).forEach(fine => {
                stats.totalFines++;
                if (!fine.isPaid) {
                    stats.totalFinesAmount += fine.price || 0;
                }
            });
            
            const finesCount = Object.keys(zoneData.multas).length;
            if (finesCount > topStats.fines.count) {
                topStats.fines = { name: zoneData.name, count: finesCount };
            }
        }

        // Contar denuncias
        if (zoneData.denuncias) {
            const complaintsCount = Object.keys(zoneData.denuncias).length;
            stats.totalComplaints += complaintsCount;
            
            if (complaintsCount > topStats.complaints.count) {
                topStats.complaints = { name: zoneData.name, count: complaintsCount };
            }
        }

        // Contar notas
        if (zoneData.notas) {
            const notesCount = Object.keys(zoneData.notas).length;
            stats.totalNotes += notesCount;
            
            if (notesCount > topStats.notes.count) {
                topStats.notes = { name: zoneData.name, count: notesCount };
            }
        }

        // Contar consultas
        if (zoneData.consultas) {
            const consultsCount = Object.keys(zoneData.consultas).length;
            stats.totalConsults += consultsCount;
            
            if (consultsCount > topStats.consults.count) {
                topStats.consults = { name: zoneData.name, count: consultsCount };
            }
        }

        // Contar operaciones
        if (zoneData.operaciones) {
            const operationsCount = Object.keys(zoneData.operaciones).length;
            stats.totalOperations += operationsCount;
            
            if (operationsCount > topStats.operations.count) {
                topStats.operations = { name: zoneData.name, count: operationsCount };
            }
        }

        // Contar usuarios en busca y captura
        if (zoneData.executors && zoneData.executors.BuscaYCaptura) {
            stats.searchUsers++;
        }

        // Contar usuarios sin datos
        if (!zoneData.datos || Object.keys(zoneData.datos).length === 0) {
            stats.usersWithoutData++;
        }
    });

    // Crear tarjetas de estadísticas generales
    statsContainer.innerHTML = `
        <div class="stat-card stat-users">
            <i class="fas fa-users"></i>
            <div class="stat-label">Usuarios Totales</div>
            <div class="stat-value">${stats.totalUsers}</div>
        </div>

        <div class="stat-card stat-fines">
            <i class="fas fa-money-bill-wave"></i>
            <div class="stat-label">Multas Pendientes</div>
            <div class="stat-value">${stats.totalFines}</div>
            <div class="stat-subtitle">${stats.totalFinesAmount.toFixed(0)}€</div>
        </div>

        <div class="stat-card stat-complaints">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="stat-label">Denuncias</div>
            <div class="stat-value">${stats.totalComplaints}</div>
        </div>

        <div class="stat-card stat-notes">
            <i class="fas fa-sticky-note"></i>
            <div class="stat-label">Notas</div>
            <div class="stat-value">${stats.totalNotes}</div>
        </div>

        <div class="stat-card stat-consults">
            <i class="fas fa-stethoscope"></i>
            <div class="stat-label">Consultas Médicas</div>
            <div class="stat-value">${stats.totalConsults}</div>
        </div>

        <div class="stat-card stat-operations">
            <i class="fas fa-procedures"></i>
            <div class="stat-label">Operaciones</div>
            <div class="stat-value">${stats.totalOperations}</div>
        </div>

        <div class="stat-card stat-search">
            <i class="fas fa-search"></i>
            <div class="stat-label">En Busca y Captura</div>
            <div class="stat-value">${stats.searchUsers}</div>
        </div>
    `;

    // Crear tarjetas de Top Stats
    topStatsContainer.innerHTML = `
        <div class="top-stat-card stat-fines">
            <i class="fas fa-money-bill"></i>
            <div class="top-stat-label">Más Multas</div>
            <div class="top-stat-name">${topStats.fines.name}</div>
            <div class="top-stat-value">${topStats.fines.count} multas</div>
        </div>

        <div class="top-stat-card stat-complaints">
            <i class="fas fa-exclamation-circle"></i>
            <div class="top-stat-label">Más Denuncias</div>
            <div class="top-stat-name">${topStats.complaints.name}</div>
            <div class="top-stat-value">${topStats.complaints.count} denuncias</div>
        </div>

        <div class="top-stat-card stat-notes">
            <i class="fas fa-edit"></i>
            <div class="top-stat-label">Más Notas</div>
            <div class="top-stat-name">${topStats.notes.name}</div>
            <div class="top-stat-value">${topStats.notes.count} notas</div>
        </div>

        <div class="top-stat-card stat-consults">
            <i class="fas fa-hospital-user"></i>
            <div class="top-stat-label">Más Consultas</div>
            <div class="top-stat-name">${topStats.consults.name}</div>
            <div class="top-stat-value">${topStats.consults.count} consultas</div>
        </div>

        <div class="top-stat-card stat-operations">
            <i class="fas fa-user-md"></i>
            <div class="top-stat-label">Más Operaciones</div>
            <div class="top-stat-name">${topStats.operations.name}</div>
            <div class="top-stat-value">${topStats.operations.count} operaciones</div>
        </div>
    `;
}

function createZoneElement(zoneId, zoneData) {
    const zoneElement = document.createElement('div');
    zoneElement.classList.add('zone');

    const zoneHeader = document.createElement('div');
    zoneHeader.classList.add('zone-header');
    zoneHeader.innerHTML = `
        <p class="zone-name">PlayStation: ${zoneData.name}</p>
        <img src="./img/user.png" class="edit-zone-btn" alt="Edit">
    `;
    zoneElement.appendChild(zoneHeader);

    const dataContainer = createDataContainer(zoneData);
    zoneElement.appendChild(dataContainer);

    const executorsContainer = createExecutorsContainer(zoneData);
    zoneElement.appendChild(executorsContainer);

    const consultsContainer = createConsultsContainer(zoneId, zoneData);
    zoneElement.appendChild(consultsContainer);

    const operationsContainer = createOperationsContainer(zoneId, zoneData);
    zoneElement.appendChild(operationsContainer);

    const notesContainer = createNotesContainer(zoneId, zoneData);
    zoneElement.appendChild(notesContainer);

    const finesContainer = createFinesContainer(zoneId, zoneData);
    zoneElement.appendChild(finesContainer);

    const complaintsContainer = createComplaintsContainer(zoneId, zoneData);
    zoneElement.appendChild(complaintsContainer);

    const buttonsContainer = createButtonsContainer(zoneId, zoneData);
    zoneElement.appendChild(buttonsContainer);

    return zoneElement;
}

function createDataContainer(zoneData) {
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
                dataFieldElement.innerHTML = `<strong>${field}:</strong> <br> ${fieldValue || ''}`;
                rowData.appendChild(dataFieldElement);
            }
    
            dataContainer.appendChild(rowData);
        }
    }
    
    return dataContainer;
}

function createExecutorsContainer(zoneData) {
    const executorsContainer = document.createElement('div');
    executorsContainer.classList.add('executors-container');        

    for (const executor in zoneData.executors) {
        const executorContainer = document.createElement('div');
        executorContainer.classList.add('executor-container');
        const executorState = zoneData.executors[executor];
        executorContainer.innerHTML = `
            <div class="panel-${executorState ? 'si' : 'no'}">
                <div class="panel-text">${executorState ? 'ACTIVO - En busca y captura en la ciudad' : 'INACTIVO - No buscado'}</div>
            </div>
        `;
        executorsContainer.appendChild(executorContainer);
    }

    return executorsContainer;
}

function createConsultsContainer(zoneId, zoneData) {
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
            <button onclick="window.updateConsult('${zoneId}', '${consultId}', '${zoneData.consultas[consultId].details}', '${zoneData.consultas[consultId].attendedBy}')" class="modify-consult-btn">Modificar Consulta</button>
            <button onclick="window.deleteConsult('${zoneId}', '${consultId}')" class="delete-consult-btn">Eliminar Consulta</button>
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

    return consultsContainer;
}

function createOperationsContainer(zoneId, zoneData) {
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
            <button onclick="window.updateOperation('${zoneId}', '${operationId}', '${zoneData.operaciones[operationId].details}', '${zoneData.operaciones[operationId].attendedBy}')" class="modify-operation-btn">Modificar Operación</button>
            <button onclick="window.deleteOperation('${zoneId}', '${operationId}')" class="delete-operation-btn">Eliminar Operación</button>
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

    return operationsContainer;
}

function createNotesContainer(zoneId, zoneData) {
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
            <button onclick="window.updateNote('${zoneId}', '${noteId}')" class="modify-note-btn">Modificar Nota</button>
            <button onclick="window.deleteNote('${zoneId}', '${noteId}')" class="delete-note-btn">Borrar Nota</button>
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

    return notesContainer;
}

function createFinesContainer(zoneId, zoneData) {
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
            <p><b>Multa ${fineName}:</b> ${fineData.description}</p>
            <p><b>Precio:</b> ${fineData.price}€ | <b>Estado:</b> ${paidStatus}</p>
            <button onclick="window.updateFine('${zoneId}', '${fineName}')" class="modify-fine-btn">Modificar</button>
            <button onclick="window.deleteFine('${zoneId}', '${fineName}')" class="delete-fine-btn">Eliminar</button>
        `;
        finesContainer.appendChild(fineContainer);

        if (!fineData.isPaid) {
            totalFineAmountInZone += fineData.price;
        }
    }

    const totalFineAmountInZoneElement = document.createElement('div');
    totalFineAmountInZoneElement.textContent = `Total dinero de multas: ${totalFineAmountInZone}€`;
    totalFineAmountInZoneElement.classList.add('total-fine-amount');

    const circleElementMultas = document.createElement('div');
    circleElementMultas.classList.add('circle');
    circleElementMultas.classList.add(totalFineAmountInZone > 50000 ? 'red' : 'green');
    totalFineAmountInZoneElement.appendChild(circleElementMultas);
    finesContainer.appendChild(totalFineAmountInZoneElement);

    return finesContainer;
}

function createComplaintsContainer(zoneId, zoneData) {
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
             <button onclick="window.updateComplaint('${zoneId}', '${complaintName}')" class="modify-complaint-btn">Modificar Denuncia</button>
             <button onclick="window.deleteComplaint('${zoneId}', '${complaintName}')" class="delete-complaint-btn">Borrar Denuncia</button>
         `;
        complaintsContainer.appendChild(complaintContainer);
    }

    const totalComplaintsElement = document.createElement('div');
    totalComplaintsElement.textContent = `Total de denuncias: ${numberOfComplaints}`;
    totalComplaintsElement.classList.add('total-fine-amount');        

    const circleElementDenuncias = document.createElement('div');
    circleElementDenuncias.classList.add('circle');
    circleElementDenuncias.classList.add(numberOfComplaints >= 20 ? 'red' : 'green');
    totalComplaintsElement.appendChild(circleElementDenuncias);
    complaintsContainer.appendChild(totalComplaintsElement);

    return complaintsContainer;
}

function createButtonsContainer(zoneId, zoneData) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons-container');        

    const buttons = [
        { text: 'Crear Datos', icon: 'fas fa-file-alt', class: 'add-data-btn', fn: () => window.addNewData(zoneId) },
        { text: 'Mod. Trabajo', icon: 'fas fa-briefcase', class: 'modify-job-btn', fn: () => window.modifyJob(zoneId, zoneData.datos?.Trabajo) },
        { text: 'Mod. Rango', icon: 'fas fa-star', class: 'modify-rank-btn', fn: () => window.modifyRank(zoneId, zoneData.datos?.Rango) },
        { text: 'Crear Consulta', icon: 'fas fa-stethoscope', class: 'add-consult-btn', fn: () => window.addNewConsult(zoneId) },
        { text: 'Crear Operación', icon: 'fas fa-procedures', class: 'add-operation-btn', fn: () => window.addNewOperation(zoneId) },
        { text: 'Crear Nota', icon: 'fas fa-sticky-note', class: 'add-note-btn', fn: () => window.addNewNote(zoneId) },
        { text: 'Crear Multa', icon: 'fas fa-money-bill', class: 'add-fine-btn', fn: () => window.addNewFine(zoneId) },
        { text: 'Crear Denuncia', icon: 'fas fa-exclamation-triangle', class: 'add-complaint-btn', fn: () => window.addNewComplaint(zoneId) },
        { text: 'Busca y Captura', icon: 'fas fa-search', class: 'add-executor-btn', fn: () => window.addNewExecutor(zoneId) },
        { text: 'Modificar Usuario', icon: 'fas fa-edit', class: 'modify-zone-name-btn', fn: () => window.modifyZoneName(zoneId, zoneData.name) },
        { text: 'Borrar Usuario', icon: 'fas fa-trash', class: 'delete-zone-btn', fn: () => window.deleteZone(zoneId) },
    ];

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add(btn.class);
        button.innerHTML = `
            <i class="${btn.icon}"></i>
            <span>${btn.text}</span>
        `;
        button.onclick = btn.fn;
        buttonsContainer.appendChild(button);
    });

    return buttonsContainer;
}

// Variables globales para los modales
let currentZoneId = null;
let currentItemId = null;
let currentAction = null;

// Funciones de Modal
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

window.closeModal = closeModal;

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Función para limpiar formularios
function clearDataForm() {
    document.getElementById('dataNombre').value = '';
    document.getElementById('dataApellido').value = '';
    document.getElementById('dataDiscord').value = '';
    document.getElementById('dataSexo').value = '';
    document.getElementById('dataNacionalidad').value = '';
    document.getElementById('dataFechaNac').value = '';
    document.getElementById('dataTrabajo').value = '';
    document.getElementById('dataRango').value = '';
}

// Función para autocompletar el formulario de datos
async function populateDataForm(zoneId) {
    const zonesSnapshot = await getDataCollection('zones');
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().datos) {
            const datos = zoneDoc.data().datos;
            document.getElementById('dataNombre').value = datos.Nombre || '';
            document.getElementById('dataApellido').value = datos.Apellido || '';
            document.getElementById('dataDiscord').value = datos.Discord || '';
            document.getElementById('dataSexo').value = datos.Sexo || '';
            document.getElementById('dataNacionalidad').value = datos.Nacionalidad || '';
            document.getElementById('dataFechaNac').value = datos.FechaNac || '';
            document.getElementById('dataTrabajo').value = datos.Trabajo || '';
            document.getElementById('dataRango').value = datos.Rango || '';
        }
    });
}

/*-----------------------------DATOS------------------------------------*/

window.addNewData = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'addData';
    
    clearDataForm();
    await populateDataForm(zoneId);
    
    openModal('dataModal');
}

document.getElementById('dataForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const newData = {
        Nombre: document.getElementById('dataNombre').value,
        Apellido: document.getElementById('dataApellido').value,
        Discord: document.getElementById('dataDiscord').value,
        Sexo: document.getElementById('dataSexo').value,
        Nacionalidad: document.getElementById('dataNacionalidad').value,
        FechaNac: document.getElementById('dataFechaNac').value,
        Trabajo: document.getElementById('dataTrabajo').value,
        Rango: document.getElementById('dataRango').value
    };
    
    await updateData(currentZoneId, 'zones', { datos: newData });
    closeModal('dataModal');
    loadZones();
});

/*-----------------------------TRABAJO------------------------------------*/

window.modifyJob = async function (zoneId, currentJob) {
    currentZoneId = zoneId;
    currentAction = 'modifyJob';
    
    document.getElementById('jobInput').value = currentJob || '';
    openModal('jobModal');
}

document.getElementById('jobForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const newJob = document.getElementById('jobInput').value.trim();
    
    if (!newJob) {
        alert('El trabajo no puede estar vacío');
        return;
    }
    
    const updatedData = { 'datos.Trabajo': newJob };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('jobModal');
    loadZones();
});

/*-----------------------------RANGO------------------------------------*/

window.modifyRank = async function (zoneId, currentRank) {
    currentZoneId = zoneId;
    currentAction = 'modifyRank';
    
    document.getElementById('rankInput').value = currentRank || '';
    openModal('rankModal');
}

document.getElementById('rankForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const newRank = document.getElementById('rankInput').value.trim();
    
    if (!newRank) {
        alert('El rango no puede estar vacío');
        return;
    }
    
    const updatedData = { 'datos.Rango': newRank };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('rankModal');
    loadZones();
});

/*-----------------------------CONSULTAS------------------------------------*/

window.addNewConsult = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'addConsult';
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().consultas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().consultas);
        }
    });
    
    document.getElementById('consultName').value = nextNumber;
    document.getElementById('consultName').disabled = true;
    document.getElementById('consultDetails').value = '';
    document.getElementById('consultAttended').value = '';
    
    openModal('consultModal');
}

window.updateConsult = async function (zoneId, consultId, details, attendedBy) {
    currentZoneId = zoneId;
    currentAction = 'updateConsult';
    currentItemId = consultId;
    
    document.getElementById('consultName').value = consultId;
    document.getElementById('consultDetails').value = details;
    document.getElementById('consultAttended').value = attendedBy;
    document.getElementById('consultName').disabled = true;
    
    openModal('consultModal');
}

document.getElementById('consultForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const consultName = document.getElementById('consultName').value;
    const consultDetails = document.getElementById('consultDetails').value.trim();
    const consultAttended = document.getElementById('consultAttended').value.trim();
    
    if (!consultDetails || !consultAttended) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const updatedData = { [`consultas.${consultName}`]: { details: consultDetails, attendedBy: consultAttended } };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('consultModal');
    document.getElementById('consultName').disabled = false;
    loadZones();
});

window.deleteConsult = async function (zoneId, consultId) {
    currentZoneId = zoneId;
    currentItemId = consultId;
    currentAction = 'deleteConsult';
    
    document.getElementById('deleteMessage').textContent = `¿Seguro que quieres borrar la consulta "${consultId}" del usuario?`;
    openModal('deleteModal');
}

/*-----------------------------OPERACIONES------------------------------------*/

window.addNewOperation = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'addOperation';
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().operaciones) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().operaciones);
        }
    });
    
    document.getElementById('operationName').value = nextNumber;
    document.getElementById('operationName').disabled = true;
    document.getElementById('operationDetails').value = '';
    document.getElementById('operationAttended').value = '';
    
    openModal('operationModal');
}

window.updateOperation = async function (zoneId, operationId, details, attendedBy) {
    currentZoneId = zoneId;
    currentAction = 'updateOperation';
    currentItemId = operationId;
    
    document.getElementById('operationName').value = operationId;
    document.getElementById('operationDetails').value = details;
    document.getElementById('operationAttended').value = attendedBy;
    document.getElementById('operationName').disabled = true;
    
    openModal('operationModal');
}

document.getElementById('operationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const operationName = document.getElementById('operationName').value;
    const operationDetails = document.getElementById('operationDetails').value.trim();
    const operationAttended = document.getElementById('operationAttended').value.trim();
    
    if (!operationDetails || !operationAttended) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const updatedData = { [`operaciones.${operationName}`]: { details: operationDetails, attendedBy: operationAttended } };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('operationModal');
    document.getElementById('operationName').disabled = false;
    loadZones();
});

window.deleteOperation = async function (zoneId, operationId) {
    currentZoneId = zoneId;
    currentItemId = operationId;
    currentAction = 'deleteOperation';
    
    document.getElementById('deleteMessage').textContent = `¿Seguro que quieres borrar la operación "${operationId}" del usuario?`;
    openModal('deleteModal');
}

/*-----------------------------NOTAS------------------------------------*/

window.addNewNote = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'addNote';
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().notas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().notas);
        }
    });
    
    document.getElementById('noteNumber').value = nextNumber;
    document.getElementById('noteNumber').disabled = true;
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
    currentAction = 'updateNote';
    currentItemId = noteId;
    
    document.getElementById('noteNumber').value = noteId;
    document.getElementById('noteText').value = noteText;
    document.getElementById('noteNumber').disabled = true;
    
    openModal('noteModal');
}

document.getElementById('noteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const noteNumber = document.getElementById('noteNumber').value;
    const noteText = document.getElementById('noteText').value.trim();
    
    if (!noteText) {
        alert('La nota no puede estar vacía');
        return;
    }
    
    const updatedData = { [`notas.${noteNumber}`]: noteText };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('noteModal');
    document.getElementById('noteNumber').disabled = false;
    loadZones();
});

window.deleteNote = async function (zoneId, noteId) {
    currentZoneId = zoneId;
    currentItemId = noteId;
    currentAction = 'deleteNote';
    
    document.getElementById('deleteMessage').textContent = `¿Seguro que quieres borrar la nota ${noteId} del usuario?`;
    openModal('deleteModal');
}

/*-----------------------------MULTAS------------------------------------*/

window.addNewFine = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'addFine';
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().multas) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().multas);
        }
    });
    
    document.getElementById('fineNumber').value = nextNumber;
    document.getElementById('fineNumber').disabled = true;
    document.getElementById('fineDescription').value = '';
    document.getElementById('finePrice').value = '';
    document.getElementById('finePaid').value = 'false';
    
    openModal('fineModal');
}

window.updateFine = async function (zoneId, fineId) {
    const zonesSnapshot = await getDataCollection('zones');
    let fineData = {};
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().multas && zoneDoc.data().multas[fineId]) {
            fineData = zoneDoc.data().multas[fineId];
        }
    });
    
    currentZoneId = zoneId;
    currentAction = 'updateFine';
    currentItemId = fineId;
    
    document.getElementById('fineNumber').value = fineId;
    document.getElementById('fineDescription').value = fineData.description || '';
    document.getElementById('finePrice').value = fineData.price || '';
    document.getElementById('finePaid').value = fineData.isPaid ? 'true' : 'false';
    document.getElementById('fineNumber').disabled = true;
    
    openModal('fineModal');
}

document.getElementById('fineForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const fineNumber = document.getElementById('fineNumber').value;
    const fineDescription = document.getElementById('fineDescription').value.trim();
    const finePrice = parseFloat(document.getElementById('finePrice').value);
    const finePaid = document.getElementById('finePaid').value === 'true';
    
    if (!fineDescription || isNaN(finePrice) || finePrice < 0) {
        alert('Por favor completa los campos correctamente');
        return;
    }
    
    const updatedData = { [`multas.${fineNumber}`]: { description: fineDescription, price: finePrice, isPaid: finePaid } };
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('fineModal');
    document.getElementById('fineNumber').disabled = false;
    loadZones();
});

window.deleteFine = async function (zoneId, fineId) {
    currentZoneId = zoneId;
    currentItemId = fineId;
    currentAction = 'deleteFine';
    
    document.getElementById('deleteMessage').textContent = `¿Seguro que quieres borrar la multa "${fineId}" del usuario?`;
    openModal('deleteModal');
}

/*-----------------------------DENUNCIAS------------------------------------*/

window.addNewComplaint = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'addComplaint';
    currentItemId = null;
    
    const zonesSnapshot = await getDataCollection('zones');
    let nextNumber = '1';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().denuncias) {
            nextNumber = getNextAvailableNumber(zoneDoc.data().denuncias);
        }
    });
    
    document.getElementById('complaintNumber').value = nextNumber;
    document.getElementById('complaintNumber').disabled = true;
    document.getElementById('complaintDescription').value = '';
    
    openModal('complaintModal');
}

window.updateComplaint = async function (zoneId, complaintId) {
    const zonesSnapshot = await getDataCollection('zones');
    let complaintText = '';
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().denuncias && zoneDoc.data().denuncias[complaintId]) {
            complaintText = zoneDoc.data().denuncias[complaintId];
        }
    });
    
    currentZoneId = zoneId;
    currentAction = 'updateComplaint';
    currentItemId = complaintId;
    
    document.getElementById('complaintNumber').value = complaintId;
    document.getElementById('complaintDescription').value = complaintText;
    document.getElementById('complaintNumber').disabled = true;
    
    openModal('complaintModal');
}

document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const complaintNumber = document.getElementById('complaintNumber').value;
    const complaintDescription = document.getElementById('complaintDescription').value.trim();
    
    if (!complaintDescription) {
        alert('La denuncia no puede estar vacía');
        return;
    }
    
    const updatedData = { [`denuncias.${complaintNumber}`]: complaintDescription };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('complaintModal');
    document.getElementById('complaintNumber').disabled = false;
    loadZones();
});

window.deleteComplaint = async function (zoneId, complaintId) {
    currentZoneId = zoneId;
    currentItemId = complaintId;
    currentAction = 'deleteComplaint';
    
    document.getElementById('deleteMessage').textContent = `¿Seguro que quieres borrar la denuncia "${complaintId}" del usuario?`;
    openModal('deleteModal');
}

/*-----------------------------BUSCA Y CAPTURA------------------------------------*/

window.addNewExecutor = async function (zoneId) {
    const zonesSnapshot = await getDataCollection('zones');
    let executorState = false;
    
    zonesSnapshot.forEach((zoneDoc) => {
        if (zoneDoc.id === zoneId && zoneDoc.data().executors) {
            executorState = zoneDoc.data().executors.BuscaYCaptura || false;
        }
    });
    
    currentZoneId = zoneId;
    currentAction = 'modifyExecutor';
    
    document.getElementById('executorActive').checked = executorState;
    openModal('executorModal');
}

document.getElementById('executorForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const isActive = document.getElementById('executorActive').checked;
    
    const updatedData = { 'executors.BuscaYCaptura': isActive };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('executorModal');
    loadZones();
});

/*-----------------------------USUARIO------------------------------------*/

window.modifyZoneName = async function (zoneId, currentName) {
    currentZoneId = zoneId;
    currentAction = 'modifyUser';
    
    document.getElementById('userInput').value = currentName || '';
    openModal('userModal');
}

document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentZoneId) return;
    
    const newName = document.getElementById('userInput').value.trim();
    
    if (!newName) {
        alert('El nombre de usuario no puede estar vacío');
        return;
    }
    
    const updatedData = { name: newName };
    
    await updateData(currentZoneId, 'zones', updatedData);
    closeModal('userModal');
    loadZones();
});

window.deleteZone = async function (zoneId) {
    currentZoneId = zoneId;
    currentAction = 'deleteUser';
    
    document.getElementById('deleteMessage').textContent = '¿Seguro que quieres borrar este perfil? Esta acción no se puede deshacer.';
    openModal('deleteModal');
}

function confirmDelete() {
    if (!currentZoneId) return;
    
    switch(currentAction) {
        case 'deleteUser':
            deleteData(currentZoneId, 'zones');
            break;
        case 'deleteNote':
            deleteField(currentZoneId, 'zones', `notas.${currentItemId}`);
            break;
        case 'deleteFine':
            deleteField(currentZoneId, 'zones', `multas.${currentItemId}`);
            break;
        case 'deleteComplaint':
            deleteField(currentZoneId, 'zones', `denuncias.${currentItemId}`);
            break;
        case 'deleteConsult':
            deleteField(currentZoneId, 'zones', `consultas.${currentItemId}`);
            break;
        case 'deleteOperation':
            deleteField(currentZoneId, 'zones', `operaciones.${currentItemId}`);
            break;
    }
    
    closeModal('deleteModal');
    loadZones();
}

window.confirmDelete = confirmDelete;

// Función para obtener el siguiente número disponible
function getNextAvailableNumber(items) {
    if (!items || Object.keys(items).length === 0) return '1';
    
    const numbers = Object.keys(items)
        .map(key => parseInt(key))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
    
    // Buscar el primer hueco disponible
    for (let i = 1; i <= numbers.length + 1; i++) {
        if (!numbers.includes(i)) {
            return i.toString();
        }
    }
    
    return (numbers.length + 1).toString();
}

/*-----------------------------NUEVO USUARIO------------------------------------*/

document.getElementById('newUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const playStationId = document.getElementById('newUserPlayStation').value.trim();
    
    if (!playStationId) {
        alert('El ID de PlayStation es requerido');
        return;
    }
    
    const newZone = { 
        name: playStationId,
        datos: {
            Nombre: document.getElementById('newUserNombre').value,
            Apellido: document.getElementById('newUserApellido').value,
            Discord: document.getElementById('newUserDiscord').value,
            Sexo: document.getElementById('newUserSexo').value,
            Nacionalidad: document.getElementById('newUserNacionalidad').value,
            FechaNac: document.getElementById('newUserFechaNac').value,
            Trabajo: document.getElementById('newUserTrabajo').value,
            Rango: document.getElementById('newUserRango').value
        },
        multas: {},
        notas: {},
        denuncias: {},
        consultas: {},
        operaciones: {},
        executors: { BuscaYCaptura: false }
    };
    
    await saveData('zones', newZone);
    closeModal('newUserModal');
    loadStats();
    alert('Usuario creado exitosamente');
});
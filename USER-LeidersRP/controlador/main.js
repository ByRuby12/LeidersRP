import { getDataCollection } from "../firebase/firebase.js";

async function searchUser() {
    const zoneNameInput = document.getElementById('zoneNameInput').value.trim();
    
    if (!zoneNameInput) {
        alert('Por favor ingresa un usuario para buscar');
        return;
    }

    const zonesSnapshot = await getDataCollection('zones');
    let userFound = false;

    zonesSnapshot.forEach((zoneDoc) => {
        const zoneData = zoneDoc.data();
        const zoneName = zoneData.name;

        if (zoneName.toLowerCase() === zoneNameInput.toLowerCase()) {
            userFound = true;
            showUserData(zoneData);
        }
    });

    if (!userFound) {
        showEmptyState();
    }
}

function showEmptyState() {
    const zonesContainer = document.getElementById('zonesContainer');
    zonesContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-user-slash"></i>
            <p>Usuario no encontrado. Intenta con otro nombre.</p>
        </div>
    `;
}

function showUserData(userData) {
    const zonesContainer = document.getElementById('zonesContainer');
    zonesContainer.innerHTML = '';

    const zoneElement = document.createElement('div');
    zoneElement.classList.add('zone');

    // HEADER CON NOMBRE Y FOTO
    const zoneHeader = document.createElement('div');
    zoneHeader.classList.add('zone-header');
    zoneHeader.innerHTML = `
        <div class="header-content">
            <img src="./img/user.png" class="profile-image" alt="Perfil">
            <div class="header-info">
                <p class="zone-name">${userData.name}</p>
                <p class="zone-subtitle">Perfil de Ciudadano</p>
            </div>
        </div>
    `;
    zoneElement.appendChild(zoneHeader);

    // DATOS PERSONALES
    if (userData && userData.datos) {
        const dataContainer = document.createElement('div');
        dataContainer.classList.add('data-container');
        dataContainer.classList.add('full-width');

        const data = userData.datos;
        const orderedFields = ['Discord', 'Nombre', 'Apellido', 'Sexo', 'Nacionalidad', 'FechaNac', 'Trabajo', 'Rango'];

        for (let i = 0; i < orderedFields.length; i += 2) {
            const rowData = document.createElement('div');
            rowData.classList.add('data-row');

            for (let j = i; j < i + 2 && j < orderedFields.length; j++) {
                const field = orderedFields[j];
                const fieldValue = data[field];
                const dataFieldElement = document.createElement('div');
                dataFieldElement.classList.add('data-element');
                dataFieldElement.innerHTML = `<strong>${field}</strong><span>${fieldValue || 'N/A'}</span>`;
                rowData.appendChild(dataFieldElement);
            }
            dataContainer.appendChild(rowData);
        }
        zoneElement.appendChild(dataContainer);
    }

    // CONTENEDOR DE GRID PARA SECCIONES
    const sectionsGrid = document.createElement('div');
    sectionsGrid.classList.add('sections-grid');

    // BUSCA Y CAPTURA
    if (userData.executors) {
        const executorsContainer = createSection(
            '<i class="fas fa-exclamation-triangle"></i> Busca y Captura'
        );
        executorsContainer.classList.add('section-small');

        for (const executor in userData.executors) {
            const executorState = userData.executors[executor];
            const status = executorState ? 'ACTIVO' : 'INACTIVO';
            const statusClass = executorState ? 'status-active' : 'status-inactive';
            const icon = executorState ? 'fa-check-circle' : 'fa-times-circle';
            
            const statusItem = document.createElement('div');
            statusItem.className = `status-item ${statusClass}`;
            statusItem.innerHTML = `
                <i class="fas ${icon}"></i>
                <span>${status} - ${executorState ? 'En busca y captura' : 'No buscado'}</span>
            `;
            executorsContainer.appendChild(statusItem);
        }
        sectionsGrid.appendChild(executorsContainer);
    }

    // CONSULTAS MÉDICAS
    if (userData.consultas && Object.keys(userData.consultas).length > 0) {
        const consultsContainer = createSection(
            '<i class="fas fa-stethoscope"></i> Consultas Médicas'
        );
        const medicalDiv = document.createElement('div');
        medicalDiv.className = 'medical-container';

        for (const consultId in userData.consultas) {
            const consult = userData.consultas[consultId];
            const medicalItem = document.createElement('div');
            medicalItem.className = 'medical-item';
            medicalItem.innerHTML = `
                <p><strong>Consulta ${consultId}:</strong> ${consult.details || 'Sin detalles'}</p>
                <p><strong>Atendido por:</strong> ${consult.attendedBy || 'No especificado'}</p>
                <p class="medical-date"><strong>Fecha:</strong> ${consult.date || 'N/A'}</p>
            `;
            medicalDiv.appendChild(medicalItem);
        }

        const totalConsults = Object.keys(userData.consultas).length;
        consultsContainer.appendChild(medicalDiv);
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'section-total';
        totalDiv.innerHTML = `<strong>Total: ${totalConsults}</strong>`;
        consultsContainer.appendChild(totalDiv);
        
        sectionsGrid.appendChild(consultsContainer);
    }

    // OPERACIONES MÉDICAS
    if (userData.operaciones && Object.keys(userData.operaciones).length > 0) {
        const operationsContainer = createSection(
            '<i class="fas fa-hospital"></i> Operaciones Médicas'
        );
        const medicalDiv = document.createElement('div');
        medicalDiv.className = 'medical-container';

        for (const operationId in userData.operaciones) {
            const operation = userData.operaciones[operationId];
            const medicalItem = document.createElement('div');
            medicalItem.className = 'medical-item';
            medicalItem.innerHTML = `
                <p><strong>Operación ${operationId}:</strong> ${operation.details || 'Sin detalles'}</p>
                <p><strong>Atendido por:</strong> ${operation.attendedBy || 'No especificado'}</p>
                <p class="medical-date"><strong>Fecha:</strong> ${operation.date || 'N/A'}</p>
            `;
            medicalDiv.appendChild(medicalItem);
        }

        const totalOperations = Object.keys(userData.operaciones).length;
        operationsContainer.appendChild(medicalDiv);
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'section-total';
        totalDiv.innerHTML = `<strong>Total: ${totalOperations}</strong>`;
        operationsContainer.appendChild(totalDiv);
        
        sectionsGrid.appendChild(operationsContainer);
    }

    // NOTAS
    if (userData.notas && Object.keys(userData.notas).length > 0) {
        const notesContainer = createSection(
            '<i class="fas fa-sticky-note"></i> Notas'
        );

        for (const noteId in userData.notas) {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <p><strong>Nota ${noteId}:</strong> ${userData.notas[noteId]}</p>
            `;
            notesContainer.appendChild(noteItem);
        }

        const totalNotes = Object.keys(userData.notas).length;
        const totalDiv = document.createElement('div');
        totalDiv.className = 'section-total';
        totalDiv.innerHTML = `<strong>Total: ${totalNotes}</strong>`;
        notesContainer.appendChild(totalDiv);
        
        sectionsGrid.appendChild(notesContainer);
    }

    // MULTAS
    if (userData.multas && Object.keys(userData.multas).length > 0) {
        const finesContainer = createSection(
            '<i class="fas fa-receipt"></i> Multas'
        );
        const finesDiv = document.createElement('div');
        finesDiv.className = 'fines-container';

        let totalFineAmount = 0;
        let unpaidFines = 0;

        for (const fineName in userData.multas) {
            const fineData = userData.multas[fineName];
            const paidStatus = fineData.isPaid ? "Pagada" : "No Pagada";
            const paidClass = fineData.isPaid ? 'paid' : 'unpaid';
            
            const fineItem = document.createElement('div');
            fineItem.className = 'fine-item';
            fineItem.innerHTML = `
                <p><strong>Multa ${fineName}:</strong> ${fineData.description}</p>
                <p><strong>Precio:</strong> <span class="price">${fineData.price}€</span></p>
                <p><strong>Estado:</strong> <span class="status-${paidClass}">${paidStatus}</span></p>
            `;
            finesDiv.appendChild(fineItem);

            if (!fineData.isPaid) {
                totalFineAmount += fineData.price;
                unpaidFines++;
            }
        }

        finesContainer.appendChild(finesDiv);
        
        const totalDiv = document.createElement('div');
        totalDiv.className = `section-total ${totalFineAmount > 50000 ? 'warning' : ''}`;
        totalDiv.innerHTML = `
            <strong>Total: ${totalFineAmount}€</strong>
            <span class="fine-count">${unpaidFines} no pagadas</span>
        `;
        finesContainer.appendChild(totalDiv);
        
        sectionsGrid.appendChild(finesContainer);
    }

    // DENUNCIAS
    if (userData.denuncias && Object.keys(userData.denuncias).length > 0) {
        const complaintsContainer = createSection(
            '<i class="fas fa-gavel"></i> Denuncias'
        );
        const criminalsDiv = document.createElement('div');
        criminalsDiv.className = 'criminal-container';

        for (const complaintName in userData.denuncias) {
            const complaintItem = document.createElement('div');
            complaintItem.className = 'criminal-item';
            complaintItem.innerHTML = `
                <p><strong>Denuncia ${complaintName}:</strong> ${userData.denuncias[complaintName]}</p>
            `;
            criminalsDiv.appendChild(complaintItem);
        }

        const totalComplaints = Object.keys(userData.denuncias).length;
        complaintsContainer.appendChild(criminalsDiv);
        
        const totalDiv = document.createElement('div');
        totalDiv.className = `section-total ${totalComplaints >= 20 ? 'danger' : ''}`;
        totalDiv.innerHTML = `<strong>Total: ${totalComplaints}</strong>`;
        complaintsContainer.appendChild(totalDiv);
        
        sectionsGrid.appendChild(complaintsContainer);
    }

    zoneElement.appendChild(sectionsGrid);
    zonesContainer.appendChild(zoneElement);
}

// FUNCIÓN AUXILIAR PARA CREAR SECCIONES
function createSection(title) {
    const section = document.createElement('div');
    section.classList.add('section-container');
    section.innerHTML = `<h3 class="section-title">${title}</h3>`;
    return section;
}

// EVENT LISTENERS
document.getElementById('searchButton').addEventListener('click', searchUser);
document.getElementById('zoneNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchUser();
});
import {saveData, deleteData, getDataCollection, updateData, deleteField} from "../firebase/firebase.js";

document.addEventListener('DOMContentLoaded', async () => {
    const storedCredentials = JSON.parse(localStorage.getItem('staffCredentials'));
    const expirationTime = localStorage.getItem('expirationTime');

    if (storedCredentials && expirationTime && Date.now() < parseInt(expirationTime)) {
        // Si hay credenciales almacenadas y no han expirado
        loadZones();

        // Habilitar el botón para agregar una nueva zona
        document.getElementById('addZoneBtn').addEventListener('click', async () => {
            const zoneName = prompt('Introduce el nombre del usuario de PlayStation:');
            if (zoneName) {
                const newZone = { name: zoneName };
                await saveData('zones', newZone);
                loadZones();
            }
        });
        
    } else {
        // Solicitar usuario y contraseña
        const username = prompt('Introduce el usuario:');
        const password = prompt('Introduce la contraseña:');

        // Verificar las credenciales (aquí podrías hacerlo de manera más segura)
        if (username === 'admin' && password === 'vivaespaña') {
            const expiration = Date.now() + (1 * 60 * 60 * 1000); // 1 hora de expiración
            localStorage.setItem('staffCredentials', JSON.stringify({ username, password }));
            localStorage.setItem('expirationTime', expiration.toString());
            
            // Recargar la página para cargar las multas
            location.reload();

        } else {
            alert('Credenciales incorrectas. Por favor, recarga la página e intenta nuevamente.');
        }
    }
});

async function loadZones() {
    const zonesContainer = document.getElementById('zonesContainer');
    zonesContainer.innerHTML = '';

    const zonesSnapshot = await getDataCollection('zones');
    zonesSnapshot.forEach((zoneDoc) => {
        const zoneData = zoneDoc.data();
        const zoneId = zoneDoc.id;

        const zoneElement = document.createElement('div');
        zoneElement.classList.add('zone');

        const zoneHeader = document.createElement('div');
        zoneHeader.classList.add('zone-header');

        zoneHeader.innerHTML = `
        <p class="zone-name">Discord: ${zoneData.name}</p>
        <img src="./img/user.png" class="edit-zone-btn">
        `;

        zoneElement.appendChild(zoneHeader);

        /*------------------------------------------------------------------------------------*/

        const dataContainer = document.createElement('div');
        dataContainer.classList.add('data-container');
        
        // Verificar si zoneData tiene una propiedad datos
        if (zoneData && zoneData.datos) {
            const data = zoneData.datos;
            const orderedFields = [
                'Playstation',
                'Discord',
                'Nombre',
                'Apellido',
                'Sexo',
                'Nacionalidad',
                'FechaNac',
                'Trabajo'
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
                    dataFieldElement.innerHTML = `<strong>${field}:</strong> ${fieldValue || ''}`;
                    rowData.appendChild(dataFieldElement);
                }
        
                dataContainer.appendChild(rowData);
            }
        } else {
            // En caso de que zoneData o zoneData.datos sean undefined
            const noDataElement = document.createElement('div');
            dataContainer.appendChild(noDataElement);
        }
        
        zoneElement.appendChild(dataContainer);
        
        /*------------------------------------------------------------------------------------*/
        // Contenedor para notas
        const notesContainer = document.createElement('div');
        notesContainer.classList.add('notes-container');

        // Título del contenedor de notas
        const notesTitle = document.createElement('h2');
        notesTitle.textContent = `NOTAS:`;
        notesContainer.appendChild(notesTitle);      

        for (const noteId in zoneData.notas) {
            const noteContainer = document.createElement('div');
            noteContainer.classList.add('note-container');
            noteContainer.innerHTML = `
                <p><b>Nota ${noteId}:</b> ${zoneData.notas[noteId]}</p>
                <button onclick="updateNote('${zoneId}', '${noteId}')" class="modify-note-btn">Modificar Nota</button>
                <button onclick="deleteNote('${zoneId}', '${noteId}')" class="delete-note-btn">Borrar Nota</button>
            `;
            notesContainer.appendChild(noteContainer);
        }

        zoneElement.appendChild(notesContainer);

        /*------------------------------------------------------------------------------------*/
        // Contenedor para multas
        const finesContainer = document.createElement('div');
        finesContainer.classList.add('fines-container');

        // Título del contenedor de multas
        const finesTitle = document.createElement('h2');
        finesTitle.textContent = `MULTAS:`;
        finesContainer.appendChild(finesTitle);

        for (const fineName in zoneData.multas) {
            const fineContainer = document.createElement('div');
            fineContainer.classList.add('fine-container');

            fineContainer.innerHTML = `
                 <p><b>Multa ${fineName}:</b> ${zoneData.multas[fineName]} </p>
                 <button onclick="updateFine('${zoneId}', '${fineName}')" class="modify-fine-btn">Modificar Multa</button>
                 <button onclick="deleteFine('${zoneId}', '${fineName}')" class="delete-fine-btn">Borrar Multa</button>
             `;

            finesContainer.appendChild(fineContainer);
        }

        zoneElement.appendChild(finesContainer);
        /*------------------------------------------------------------------------------------*/
        // Contenedor para denuncias
        const complaintsContainer = document.createElement('div');
        complaintsContainer.classList.add('complaints-container');

        // Título del contenedor de denuncias
        const complaintTitle = document.createElement('h2');
        complaintTitle.textContent = `DENUNCIAS:`;
        complaintsContainer.appendChild(complaintTitle);  

        for (const complaintName in zoneData.denuncias) {
            const complaintContainer = document.createElement('div');
            complaintContainer.classList.add('complaint-container');

            complaintContainer.innerHTML = `
                 <p><b>Denuncia ${complaintName}:</b> ${zoneData.denuncias[complaintName]} </p>
                 <button onclick="updateComplaint('${zoneId}', '${complaintName}')" class="modify-complaint-btn">Modificar Denuncia</button>
                 <button onclick="deleteComplaint('${zoneId}', '${complaintName}')" class="delete-complaint-btn">Borrar Denuncia</button>
             `;

            complaintsContainer.appendChild(complaintContainer);
        }

        zoneElement.appendChild(complaintsContainer);

        /*------------------------------------------------------------------------------------*/
        // Contenedor para ejecutores
        const executorsContainer = document.createElement('div');
        executorsContainer.classList.add('executors-container');

        // Título del contenedor de busca y captura
        const buscaTitle = document.createElement('h2');
        buscaTitle.textContent = `BUSCA Y CAPTURA:`;
        executorsContainer.appendChild(buscaTitle);       

        for (const executor in zoneData.executors) {
            const executorContainer = document.createElement('div');
            executorContainer.classList.add('executor-container');

            executorContainer.innerHTML = `
                <p><b>Busca y Captura:</b> ${zoneData.executors[executor] ? 'SI' : 'NO'}</p>
                <button onclick="updateExecutor('${zoneId}', '${executor}')" class="modify-sensor-btn">Modificar</button>
                <button onclick="deleteExecutor('${zoneId}', '${executor}')" class="delete-executor-btn">Borrar</button>
            `;

            executorsContainer.appendChild(executorContainer);
        }

        zoneElement.appendChild(executorsContainer);

        /*------------------------------------------------------------------------------------*/

        // Contenedor para botones
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons-container');        

        // Botón para agregar nuevos datos
        const addDataButton = document.createElement('button');
        addDataButton.textContent = 'Crear Datos';
        addDataButton.onclick = () => addNewData(zoneId);
        addDataButton.classList.add('add-data-btn');
        buttonsContainer.appendChild(addDataButton);

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

        // Botón para modificar el nombre de la zona
        const modifyZoneNameButton = document.createElement('button');
        modifyZoneNameButton.textContent = 'Modificar Usuario';
        modifyZoneNameButton.onclick = () => modifyZoneName(zoneId, zoneData.name);
        modifyZoneNameButton.classList.add('modify-zone-name-btn');
        buttonsContainer.appendChild(modifyZoneNameButton);

        // Botón para borrar la zona
        const deleteZoneButton = document.createElement('button');
        deleteZoneButton.textContent = 'Borrar Usuario';
        deleteZoneButton.onclick = () => deleteZone(zoneId);
        deleteZoneButton.classList.add('delete-zone-btn');
        buttonsContainer.appendChild(deleteZoneButton);

        zoneElement.appendChild(buttonsContainer);

        zonesContainer.appendChild(zoneElement);
    });
}

/*-----------------------------ZONA/USUARIO------------------------------------*/

window.deleteZone = async function (zoneId) {
    const confirmDelete = confirm('¿Seguro que quieres borrar este perfil?');
    if (confirmDelete) {
        await deleteData(zoneId, 'zones');
        loadZones(); 
    }
}

window.modifyZoneName = async function (zoneId, currentName) {
    const newZoneName = prompt('Introduce el ID de Discord', currentName);
    if (newZoneName && newZoneName !== currentName) {
        const updatedData = {
            name: newZoneName,
        };

        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

/*-----------------------------BUSCA Y CAPTURA------------------------------------*/

window.addNewExecutor = async function (zoneId) {
    const activateExecutor = confirm('¿El Ciudadano está en busca y captura?');

    const updatedData = {
        'executors.BuscaYCaptura': activateExecutor,
    };

    await updateData(zoneId, 'zones', updatedData);
    loadZones();
}

window.updateExecutor = async function (zoneId, executorName) {
    const activateExecutor = confirm(`¿El Ciudadano está en Busca y Captura?`);

    const updatedData = {
        [`executors.${executorName}`]: activateExecutor,
    };

    await updateData(zoneId, 'zones', updatedData);
    loadZones();
}

window.deleteExecutor = async function (zoneId, executorName) {
    const confirmDelete = confirm(`¿Seguro que quieres borrar el ejecutor "${executorName}" de la zona?`);
    if (confirmDelete) {
        await deleteField(zoneId, 'zones', `executors.${executorName}`);
        loadZones();
    }
}

/*-----------------------------NOTAS------------------------------------*/

window.addNewNote = async function (zoneId) {
    const noteName = prompt('Introduce el nombre de la nueva nota:');
    const noteText = prompt('Introduce el texto de la nueva nota:');
    if (noteName && noteText) {
        const updatedData = {
            [`notas.${noteName}`]: noteText,
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.updateNote = async function (zoneId, noteId) {
    const newText = prompt('Introduce el nuevo texto de la nota:', '');
    if (newText !== null) {
        const updatedData = {
            [`notas.${noteId}`]: newText,
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.deleteNote = async function (zoneId, noteId) {
    const confirmDelete = confirm(`¿Seguro que quieres borrar la nota ${noteId} de la zona?`);
    if (confirmDelete) {
        await deleteField(zoneId, 'zones', `notas.${noteId}`);
        loadZones();
    }
}

/*-----------------------------MULTAS------------------------------------*/

window.addNewFine = async function (zoneId) {
    const fineName = prompt('Introduce el nombre de la nueva multa:');
    const fineDescription = prompt('Introduce la descripción de la nueva multa:');
    if (fineName && fineDescription) {
        const updatedData = {
            [`multas.${fineName}`]: fineDescription,
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.updateFine = async function (zoneId, fineId) {
    const newDescription = prompt('Introduce la nueva descripción de la multa:', '');
    if (newDescription !== null) {
        const updatedData = {
            [`multas.${fineId}`]: newDescription,
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.deleteFine = async function (zoneId, fineId) {
    const confirmDelete = confirm(`¿Seguro que quieres borrar la multa "${fineId}" de la zona?`);
    if (confirmDelete) {
        await deleteField(zoneId, 'zones', `multas.${fineId}`);
        loadZones();
    }
}

/*-----------------------------DENUNCIAS------------------------------------*/

window.addNewComplaint = async function (zoneId) {
    const complaintName = prompt('Introduce el nombre de la nueva denuncia:');
    const complaintDescription = prompt('Introduce la descripción de la nueva denuncia:');
    if (complaintName && complaintDescription) {
        const updatedData = {
            [`denuncias.${complaintName}`]: complaintDescription,
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.updateComplaint = async function (zoneId, complaintId) {
    const newDescription = prompt('Introduce la nueva descripción de la denuncia:', '');
    if (newDescription !== null) {
        const updatedData = {
            [`denuncias.${complaintId}`]: newDescription,
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.deleteComplaint = async function (zoneId, complaintId) {
    const confirmDelete = confirm(`¿Seguro que quieres borrar la denuncia "${complaintId}" de la zona?`);
    if (confirmDelete) {
        await deleteField(zoneId, 'zones', `denuncias.${complaintId}`);
        loadZones();
    }
}

/*-----------------------------DATOS------------------------------------*/

window.addNewData = async function (zoneId) {
    const Playstation = prompt('Introduce el ID de Playstation:');
    const Discord = prompt('Introduce el ID de Discord:'); 
    const Nombre = prompt('Introduce el Nombre:');
    const Apellido = prompt('Introduce el Apellido:');
    const Sexo = prompt('Introduce el Sexo:');
    const Nacionalidad = prompt('Introduce la Nacionalidad:');
    const FechaNac = prompt('Introduce la Fecha de Nacimiento:');
    const Trabajo = prompt('Introduce el Trabajo:');

    if (Nombre && Apellido && Sexo && Nacionalidad && FechaNac && Playstation && Discord && Trabajo) {
        const newData = {
            Playstation,
            Discord,
            Nombre,
            Apellido,
            Sexo,
            Nacionalidad,
            FechaNac,
            Trabajo
        };

        await updateData(zoneId, 'zones', { datos: newData });
        loadZones();
    }
}

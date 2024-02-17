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
            const expiration = Date.now() + (30 * 60 * 1000); // 30 minutos en milisegundos
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
// Contenedor para datos
        const dataContainer = document.createElement('div');
        dataContainer.classList.add('data-container');
        
        // Verificar si zoneData tiene una propiedad datos
        if (zoneData && zoneData.datos) {
            const data = zoneData.datos;
            const orderedFields = [
                'Playstation',
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

        // Verificar si zoneData.notas está definido
        const numberOfNotes = zoneData.notas ? Object.keys(zoneData.notas).length : 0;

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

        // Crear elemento para mostrar el total de notas en esta zona
        const totalNotesElement = document.createElement('div');
        totalNotesElement.textContent = `Total notas: ${numberOfNotes}`; 
        totalNotesElement.classList.add('total-fine-amount'); 

        // Crear círculo de color verde
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
            const fineContainer = document.createElement('div');
            fineContainer.classList.add('fine-container');

            const fineData = zoneData.multas[fineName];
            fineContainer.innerHTML = `
                 <p><b>Multa ${fineName}:</b> ${fineData.description} - ${fineData.price}€</p>
                 <button onclick="updateFine('${zoneId}', '${fineName}')" class="modify-fine-btn">Modificar Multa</button>
                 <button onclick="deleteFine('${zoneId}', '${fineName}')" class="delete-fine-btn">Borrar Multa</button>
                 `;

            finesContainer.appendChild(fineContainer);

            totalFineAmountInZone += fineData.price;
        }

        // Mostrar el total de dinero de las multas en esta zona
        const totalFineAmountInZoneElement = document.createElement('div');
        totalFineAmountInZoneElement.textContent = `Total dinero de multas: ${totalFineAmountInZone}€`;
        totalFineAmountInZoneElement.classList.add('total-fine-amount');

        const circleElement = document.createElement('div');
        circleElement.classList.add('circle');

        if (totalFineAmountInZone > 50000) {
            circleElement.classList.add('red');
        } else {
            circleElement.classList.add('green');
        }

        totalFineAmountInZoneElement.appendChild(circleElement);
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
                 <button onclick="deleteComplaint('${zoneId}', '${complaintName}')" class="delete-complaint-btn">Borrar Denuncia</button>
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

        // Botón para agregar nuevos datos
        const addDataButton = document.createElement('button');
        addDataButton.textContent = 'Crear Datos';
        addDataButton.onclick = () => addNewData(zoneId);
        addDataButton.classList.add('add-data-btn');
        buttonsContainer.appendChild(addDataButton);

        // Botón para modificar el trabajo
        const modifyJobButton = document.createElement('button');
        modifyJobButton.textContent = 'Modificar Trabajo';
        modifyJobButton.onclick = () => modifyJob(zoneId, zoneData.datos.Trabajo);
        modifyJobButton.classList.add('modify-job-btn');
        buttonsContainer.appendChild(modifyJobButton);

        // Botón para modificar el rango
        const modifyRankButton = document.createElement('button');
        modifyRankButton.textContent = 'Modificar Rango';
        modifyRankButton.onclick = () => modifyRank(zoneId, zoneData.datos.Rango);
        modifyRankButton.classList.add('modify-rank-btn');
        buttonsContainer.appendChild(modifyRankButton);

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
    const activateExecutor = confirm('¿El Ciudadano está en Busca y Captura? (Aceptar: Si y Cancelar: No)');

    const updatedData = {
        'executors.BuscaYCaptura': activateExecutor,
    };

    await updateData(zoneId, 'zones', updatedData);
    loadZones();
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
    const finePrice = parseFloat(prompt('Introduce el precio de la multa en €:'));
    if (fineName && fineDescription && !isNaN(finePrice) && finePrice >= 0) {
        const updatedData = {
            [`multas.${fineName}`]: { description: fineDescription, price: finePrice },
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    } else {
        alert('Por favor, introduce valores válidos para la multa.');
    }
}

window.updateFine = async function (zoneId, fineId) {
    const newDescription = prompt('Introduce la nueva descripción de la multa:');
    const newPrice = parseFloat(prompt('Introduce el nuevo precio de la multa en €:'));
    if (newDescription && !isNaN(newPrice) && newPrice >= 0) {
        const updatedData = {
            [`multas.${fineId}`]: { description: newDescription, price: newPrice },
        };
        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    } else {
        alert('Por favor, introduce valores válidos para la modificación de la multa.');
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
    const Nombre = prompt('Introduce el Nombre:');
    const Apellido = prompt('Introduce el Apellido:');
    const Sexo = prompt('Introduce el Sexo:');
    const Nacionalidad = prompt('Introduce la Nacionalidad:');
    const FechaNac = prompt('Introduce la Fecha de Nacimiento:');
    const Trabajo = prompt('Introduce el Trabajo:');
    const Rango = prompt('Introduce el Rango de tu Trabajo:'); 

    if (Nombre && Apellido && Sexo && Nacionalidad && FechaNac && Playstation && Rango && Trabajo) {
        const newData = {
            Playstation,
            Nombre,
            Apellido,
            Sexo,
            Nacionalidad,
            FechaNac,
            Trabajo,
            Rango
        };

        await updateData(zoneId, 'zones', { datos: newData });
        loadZones();
    }
}

window.modifyJob = async function (zoneId, currentJob) {
    const newJob = prompt('Introduce el nuevo trabajo:', currentJob);
    if (newJob && newJob !== currentJob) {
        const updatedData = {
            'datos.Trabajo': newJob,
        };

        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

window.modifyRank = async function (zoneId, currentRank) {
    const newRank = prompt('Introduce el nuevo rango:', currentRank);
    if (newRank && newRank !== currentRank) {
        const updatedData = {
            'datos.Rango': newRank,
        };

        await updateData(zoneId, 'zones', updatedData);
        loadZones();
    }
}

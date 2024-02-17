import { getDataCollection, updateData } from "../firebase/firebase.js";
import { multas } from './multas.js';

document.addEventListener('DOMContentLoaded', async () => {
    const storedCredentials = JSON.parse(localStorage.getItem('PDACredentials'));
    const expirationTime = localStorage.getItem('expirationTime');

    if (storedCredentials && expirationTime && Date.now() < parseInt(expirationTime)) {
        // Si hay credenciales almacenadas y no han expirado
        loadZones();

        // Definición de la función para filtrar multas
        function filterMultas() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const filteredMultas = multas.filter(multa =>
                multa.numero.toString().includes(searchTerm) ||
                multa.descripcion.toLowerCase().includes(searchTerm)
            );
            displayMultas(filteredMultas);
        }

        // Escuchar eventos de entrada en el campo de búsqueda
        document.getElementById('searchInput').addEventListener('input', filterMultas);

        // Función para mostrar las multas filtradas en la página
        function displayMultas(filteredMultas) {
            const multasListContainer = document.getElementById('multasList');
            multasListContainer.innerHTML = '';
            if (filteredMultas.length === 0) {
                multasListContainer.innerHTML = '<p>No se encontraron multas.</p>';
            } else {
                const table = document.createElement('table');
                table.classList.add('multas-table'); // Agregar clase a la tabla
                table.innerHTML = `
                    <tr>
                        <th>ARTICULO</th>
                        <th>DESCRIPCION</th>
                        <th>CANTIDAD</th>
                        <th>SENTENCIA</th>
                    </tr>
                `;
                filteredMultas.forEach(multa => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${multa.numero}</td>
                        <td>${multa.descripcion}</td>
                        <td>${multa.precio}€</td>
                        <td>${multa.mesesPrision} meses</td>
                    `;
                    table.appendChild(tr);
                });
                multasListContainer.appendChild(table);
            }
        }

        // Mostrar todas las multas al cargar la página
        displayMultas(multas);
    } else {
        // Solicitar usuario y contraseña
        const username = prompt('Introduce el usuario:');
        const password = prompt('Introduce la contraseña:');

        // Verificar las credenciales (aquí podrías hacerlo de manera más segura)
        if (username === 'cnp' && password === 'superverga') {
            const expiration = Date.now() + (1 * 60 * 60 * 1000); // 1 hora de expiración
            localStorage.setItem('PDACredentials', JSON.stringify({ username, password }));
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
            const fineContainer = document.createElement('div');
            fineContainer.classList.add('fine-container');

            const fineData = zoneData.multas[fineName];
            fineContainer.innerHTML = `
                 <p><b>Multa ${fineName}:</b> ${fineData.description} - ${fineData.price}€</p>
                 <button onclick="updateFine('${zoneId}', '${fineName}')" class="modify-fine-btn">Modificar Multa</button>
             `;

            finesContainer.appendChild(fineContainer);

            totalFineAmountInZone += fineData.price;
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
    });
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

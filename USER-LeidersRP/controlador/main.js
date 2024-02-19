import { getDataCollection } from "../../firebase.js";

async function searchUser() {
    const zoneNameInput = document.getElementById('zoneNameInput').value;
    const zonesSnapshot = await getDataCollection('zones');
    let userFound = false;

    zonesSnapshot.forEach((zoneDoc) => {
        const zoneData = zoneDoc.data();
        const zoneName = zoneData.name.toLowerCase();

        if (zoneName === zoneNameInput.toLowerCase()) {
            userFound = true;
            // Llamar a la función para mostrar solo los datos del usuario encontrado
            showUserData(zoneData);
        }
    });

    if (!userFound) {
        alert('Usuario no encontrado');
    }
}

function showUserData(userData) {
    // Esta función muestra los datos completos del usuario en el contenedor 'zonesContainer'
    const zonesContainer = document.getElementById('zonesContainer');
    zonesContainer.innerHTML = '';

    const zoneElement = document.createElement('div');
    zoneElement.classList.add('zone');

    const zoneHeader = document.createElement('div');
    zoneHeader.classList.add('zone-header');

    zoneHeader.innerHTML = `
        <p class="zone-name">Discord: ${userData.name}</p>
        <img src="./img/user.png" class="edit-zone-btn">
    `;

    zoneElement.appendChild(zoneHeader);

/*------------------------------------------------------------------------------------------*/

    const dataContainer = document.createElement('div');
    dataContainer.classList.add('data-container');

    // Verificar si userData tiene una propiedad datos
    if (userData && userData.datos) {
        const data = userData.datos;
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
                dataFieldElement.innerHTML = `<strong>${field}:</strong> <br> ${fieldValue || ''}`;
                rowData.appendChild(dataFieldElement);
            }

            dataContainer.appendChild(rowData);
        }
    } else {
        // En caso de que userData o userData.datos sean undefined
        const noDataElement = document.createElement('div');
        dataContainer.appendChild(noDataElement);
    }

    zoneElement.appendChild(dataContainer);

/*------------------------------------------------------------------------------------*/
    // Contenedor para notas
    const notesContainer = document.createElement('div');
    notesContainer.classList.add('notes-container');

    const notesTitle = document.createElement('h2');

    notesTitle.textContent = `NOTAS:`;
    notesContainer.appendChild(notesTitle);

    // Verificar si userData.notas está definido
    const numberOfNotes = userData.notas ? Object.keys(userData.notas).length : 0;

    for (const noteId in userData.notas) {
        const noteContainer = document.createElement('div');
        noteContainer.classList.add('note-container');
        noteContainer.innerHTML = `
            <p><b>Nota ${noteId}:</b> ${userData.notas[noteId]}</p>
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

    for (const fineName in userData.multas) {
        const fineData = userData.multas[fineName];
        const fineContainer = document.createElement('div');
        fineContainer.classList.add('fine-container');

        const paidStatus = fineData.isPaid ? "Pagada" : "No Pagada";
        fineContainer.innerHTML = `
        <p><b>Multa ${fineName}:</b> ${fineData.description} <br> <b>Precio ➜</b> ${fineData.price}€ <br> <b>Estado ➜</b> ${paidStatus}</p>
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

    const numberOfComplaints = userData.denuncias ? Object.keys(userData.denuncias).length : 0;

    for (const complaintName in userData.denuncias) {
        const complaintContainer = document.createElement('div');
        complaintContainer.classList.add('complaint-container');

        complaintContainer.innerHTML = `
             <p><b>Denuncia ${complaintName}:</b> ${userData.denuncias[complaintName]} </p>
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

    zonesContainer.appendChild(zoneElement);
}

document.getElementById('searchButton').addEventListener('click', searchUser);

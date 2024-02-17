import { saveData } from "../firebase/firebase.js";

// Variable para controlar si se ha enviado el usuario y datos previamente
let usuarioEnviado = localStorage.getItem('usuarioEnviado') === 'true';

// Función para agregar nuevos datos al usuario y crear usuario
async function addNewData() {
    // Verificar si el usuario ya ha sido enviado previamente
    if (usuarioEnviado) {
        alert('El usuario ya ha sido creado anteriormente. Si hay algún problema, contacta a un policía o alcalde.');
        return;
    }

    const zoneName = prompt('Introduce el ID de Discord:');
    if (zoneName) {
        const Playstation = prompt('Introduce el ID de Playstation:');
        const Nombre = prompt('Introduce el Nombre:');
        const Apellido = prompt('Introduce el Apellido:');
        const Sexo = prompt('Introduce el Sexo:');
        const Nacionalidad = prompt('Introduce la Nacionalidad:');
        const FechaNac = prompt('Introduce la Fecha de Nacimiento:');
        const Trabajo = prompt('Introduce el Trabajo:');
        const Rango = prompt('Introduce el Rango del Trabajo:'); 

        if (Nombre && Apellido && Sexo && Nacionalidad && FechaNac && Playstation && Rango && Trabajo) {
            const newZone = { 
                name: zoneName,
                datos: {
                    Playstation,
                    Nombre,
                    Apellido,
                    Sexo,
                    Nacionalidad,
                    FechaNac,
                    Trabajo,
                    Rango
                },
                executors: {
                    'BuscaYCaptura': false // Nuevo usuario, inicialmente no buscado
                }
            };

            // Guardar los datos en la base de datos
            await saveData('zones', newZone);

            // Mostrar una alerta indicando que se han agregado los datos
            alert('¡Usuario y datos agregados correctamente!');
            
            // Marcar que el usuario y datos han sido enviados
            usuarioEnviado = true;
            localStorage.setItem('usuarioEnviado', 'true');
        }
    }
}

// Evento cuando el DOM se ha cargado
document.addEventListener('DOMContentLoaded', async () => {
    // Habilitar el botón para agregar una nueva zona
    document.getElementById('addZoneBtn').addEventListener('click', addNewData);

    // Deshabilitar el botón si el usuario ya ha sido enviado previamente
    if (usuarioEnviado) {
        document.getElementById('addZoneBtn').disabled = true;
    }
});

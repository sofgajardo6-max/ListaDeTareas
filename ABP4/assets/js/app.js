class Tarea {
    constructor(nombre, id, descripcion, prioridad, fecha, completada = false) {
        this.nombre = nombre;
        this.id = id;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.fecha = fecha;
        this.completada = completada;
    }
}

let listaDeTareas = [];

//el codigo núcleo:
function renderizarTareas() {
    const contenedorTareas = document.getElementById("listaTareas");
    contenedorTareas.innerHTML = "";

    const tareasAPI = listaDeTareas.filter(t => t.descripcion === "Descripción de ejemplo");
    const tareasPropias = listaDeTareas.filter(t => t.descripcion !== "Descripción de ejemplo");
    
    const crearHTML = (lista, titulo) => {
        if (lista.length === 0) return "";
        let html = `<h2>${titulo}</h2><ul>`;
        lista.forEach(tarea => {
            const {nombre, id, descripcion, prioridad, fecha, completada} = tarea;
            
            let mensajeFecha = "📅 Sin fecha";
            if (fecha) {
                const dias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
                const fechaDias =  `(${fecha})`;
                if (dias === 0) mensajeFecha = `Fecha:⏳ Vence hoy ${fechaDias}`;
                else if (dias === 1) mensajeFecha = `Fecha:⏳ Mañana (falta 1 día) ${fechaDias}`;
                else if (dias > 1) mensajeFecha = `Fecha:⏳ Faltan ${dias} días ${fechaDias}`;
                else mensajeFecha = `Fecha: ⚠️ Tarea vencida ${fechaDias}`;
            }

            html += `
            <li id="tarea-${id}" class="${completada ? 'completada' : ''}">
                <div class="tarea-header">
                    <input type="checkbox" ${completada ? "checked" : ""} onclick="toggleCompletada(${id})">
                    <h3>${nombre}</h3>
                </div>
                
                <div class="tarea-cuerpo"> 
                    <p>${descripcion || "Sin descripción"}</p>
                    <p>Estado: <strong>${completada ? "COMPLETADA" : "PENDIENTE"}</strong></p>
                    <p class="fecha-info">${mensajeFecha}</p>
                    <button class="btn-borrar" onclick="eliminarTarea(${id})">Eliminar</button>
                </div>
            </li>`;
        });
        html += `</ul>`;
        return html;
    };

    contenedorTareas.innerHTML = crearHTML(tareasPropias, "Mis Tareas") + 
                                 crearHTML(tareasAPI, "Tareas de Ejemplo (API)");
}


//fetch de forma asíncrona

async function fetchDatos(){
    try {

        const guardadas = localStorage.getItem("misTareasGuardadas");
        if (guardadas) {
            listaDeTareas = JSON.parse(guardadas);
        }
        const respuesta = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        const datos = await respuesta.json();
        const nombresSentido = ["Comprar comida", "Hacer ejercicio", "Leer un libro", "Limpiar la casa", "Aprender JavaScript"];
       
        datos.forEach((dato, i) => {
            const tarea = new Tarea(nombresSentido[i], dato.id, "Descripción de ejemplo", "Pendiente", "12-12-2026", dato.completed);
            listaDeTareas.push(tarea);
        });
        renderizarTareas();
    } catch (error) { console.error("Error al obtener datos:", error); }
}
fetchDatos();

//para que el boton de marcado sirva, si esta completada la tarea, al hacer click se marque como pendiente y viceversa
function toggleCompletada(id) {
    const tarea = listaDeTareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        renderizarTareas();
        guardarEnLocalStorage();
    }
}
const btnGuardar = document.getElementById("agregarTarea");
btnGuardar.addEventListener("click", () => {
    //sacar texto del input
    const nombreInput = document.getElementById("nuevaTarea").value;
    const descInput = document.getElementById("descripcionTarea").value;
    const prioridad = document.getElementById("prioridadTareas").value;
    const fechaInput = document.getElementById("fechalimite").value;
    
    if (nombreInput.trim() !== "") {
        const nuevaTarea = new Tarea(
            nombreInput, 
            Date.now(),
            descInput,
            prioridad,
            fechaInput, 
        );
        //se mete al array
        listaDeTareas.push(nuevaTarea);
        renderizarTareas();
        guardarEnLocalStorage();
        mostrarNotificacion("¡Tarea guardada con éxito!", "notiGuardar");

     // Limpiar
        document.getElementById("nuevaTarea").value = "";
        document.getElementById("descripcionTarea").value = "";
    } else {
        alert("Escribe el nombre de la tarea!");
    }
});

function eliminarTarea(id) {
    listaDeTareas = listaDeTareas.filter(t => t.id !== id);
    renderizarTareas();
    guardarEnLocalStorage();
    mostrarNotificacion("¡Tarea eliminada con éxito!", "notiEliminar");
}

//eliminar tareas APIs de ejemplo
const btnEliminarAPI = document.getElementById("btnEliminarAPI");
btnEliminarAPI.addEventListener("click", () => {
    listaDeTareas = listaDeTareas.filter(t => t.descripcion !== "Descripción de ejemplo");
    renderizarTareas();
    mostrarNotificacion("¡APIs de ejemplo eliminado con éxito!", "notiEliminar");

});

//poner fecha opcional dependiendo la prioridad de la tarea
const selectPrioridad = document.getElementById("prioridadTareas");
const inputFecha = document.getElementById("fechalimite");

selectPrioridad.addEventListener("change" , () => {
    if (selectPrioridad.value === "urgente" || selectPrioridad.value === "importante") {
        inputFecha.style.display = "block"; //mostrar
    } else {
        inputFecha.style.display = "none"; //se oculta
    }
})

function guardarEnLocalStorage() {
    const tareasGuardadas = listaDeTareas.filter(t => t.descripcion !== "Descripción de ejemplo");
    localStorage.setItem("misTareasGuardadas", JSON.stringify(tareasGuardadas));
}


//KEYUP para que funcione el ENTER 
const formulario = document.querySelector(".container"); 
formulario.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        // excepto en el textarea
        if (event.target.id !== "descripcionTarea") {
            document.getElementById("agregarTarea").click();
        }
    }
});
//MOUSEOVER
document.getElementById("listaTareas").addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("btn-borrar")) {
        e.target.style.backgroundColor = "red";
        e.target.style.color = "white";
    }
});
document.getElementById("listaTareas").addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("btn-borrar")) {
        e.target.style.backgroundColor = "";
        e.target.style.color = "";
    }
});

//notificacion con un retraso de 2 seg.
function mostrarNotificacion(mensaje, clase = "") {
    const notificacion = document.createElement("div");
    notificacion.classList.add("notificacion-css", clase); 

    notificacion.innerText = mensaje;
    document.body.appendChild(notificacion);

setTimeout(() => {
        notificacion.remove();
    }, 2000);
}

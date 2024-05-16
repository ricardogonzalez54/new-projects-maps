// Variable para almacenar el ángulo de rotación en grados
var rotate_degrees = -27.3 + 90; // Por ejemplo, puedes establecer aquí el ángulo de rotación deseado
// Variable que controla el movimiento de teclado
const step= 10;

// Inicializar Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZGllZ28tY2xiYiIsImEiOiJjbHNjbWZodHEwcWtxMmxxdW13NzkxamV5In0.GpUh5FL_TGYPxXuuAUwvDA';
var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/mapbox/streets-v11',
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    center: [-73.06180165035789, -36.83121502282673],
    zoom: 15.2,
    bearing: rotate_degrees,
    keyboard: false,
    
});
let socket = new WebSocket("ws://localhost:5353/ws"); //Usar ip del pc que abre el puerto
var data = {}

    socket.onopen = function(e) {
        console.log("[open] Conexión establecida");
    };

    socket.onmessage = function(event){
        var data =JSON.parse(JSON.parse(event.data));
        console.log(data)
        //console.log(data.features.find(objecto => objecto.id === '0'));
        console.log(typeof(data))

        if (map.getSource('puntosDinamicos')) {
            map.getSource('puntosDinamicos').setData(data);
        }

    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('[close] Conexión cerrada limpiamente, código=${event.code} motivo=${event.reason}');
        } else {
            // Ejemplo: El servidor cierra la conexión o se pierde la conexión
            console.log('[close] Conexión cerrada abruptamente');
        }
    };

    socket.onerror = function(error) {
        console.log('[error] ${error.message}');
};

// Inicializar Mapbox Draw
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});
map.addControl(draw);

// Manejador de evento para el botón de guardar
document.getElementById('saveButton').addEventListener('click', function() {
    // Obtener todas las geometrías dibujadas
    var features = draw.getAll().features;
    if (features.length>1){
        alert("Debe seleccionar solo 1 área de interés");
        return
    }
    // Iterar sobre las geometrías y agregar nombre y categoría
    features.forEach(function(feature) {
        // Aquí puedes permitir al usuario ingresar el nombre y la categoría
        var nombre = prompt("Ingrese el nombre del proyecto:");

        // Asignar nombre y categoría a las propiedades de la geometría
        feature.properties = {
            name: nombre
        };

        // Configurar la URL a la que deseas enviar los datos
        const url = 'http://localhost:5353/receive-geojson';

        // Configurar las opciones de la petición fetch
        const options = {
          method: 'POST', // Método POST para enviar datos al servidor
          headers: {
            'Content-Type': 'application/json' // Tipo de contenido es JSON
          },
          body: JSON.stringify(feature) // Convierte el objeto a formato JSON
        };

        // Realizar la petición fetch
        fetch(url, options)
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en la petición fetch');
            }
            return response.json(); // Procesar la respuesta del servidor
          })
          .then(data => {
            console.log('Respuesta del servidor:', data);
          })
          .catch(error => {
            console.error('Error:', error);
          });
    });
});
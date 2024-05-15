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
let socket = new WebSocket("ws://192.168.31.23:5353/ws"); //Usar ip del pc que abre el puerto
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
            console.log(`[close] Conexión cerrada limpiamente, código=${event.code} motivo=${event.reason}`);
        } else {
            // Ejemplo: El servidor cierra la conexión o se pierde la conexión
            console.log('[close] Conexión cerrada abruptamente');
        }
    };

    socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
};

map.on('load', function () {
    // Preparar el mapa para recibir puntos desde WebSocket
    map.addSource('puntosDinamicos', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        id: 'puntos',
        type: 'circle',
        source: 'puntosDinamicos',
        paint: {
            'circle-radius': 6,
            'circle-color': '#B42222'
        }
    });
});

// // Agregar control de navegación al mapa
// map.addControl(new mapboxgl.NavigationControl());

// Rotar la vista del mapa


// Inicializar Mapbox Draw
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        // line_string: true, NO QUEREMOS LINEAS
        polygon: true,
        trash: true
    }
});
map.addControl(draw);

// Manejador de evento para el botón de guardar
document.getElementById('saveButton').addEventListener('click', function() {
    // Obtener todas las geometrías dibujadas
    var features = draw.getAll().features;

    // Iterar sobre las geometrías y agregar nombre y categoría
    features.forEach(function(feature) {
        // Aquí puedes permitir al usuario ingresar el nombre y la categoría
        var nombre = prompt("Ingrese el nombre para esta geometría:");
        var categoria = prompt("Ingrese la categoría para esta geometría:");

        // Asignar nombre y categoría a las propiedades de la geometría
        feature.properties = {
            name: nombre,
            category: categoria
        };

        // Configurar la URL a la que deseas enviar los datos
        const url = 'http://192.168.31.58:5353/receive-geojson';

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
        
// Manejador de evento para el botón de dibujar área verde
// document.getElementById('drawGreenAreaButton').addEventListener('click', function() {
//     // Configurar el estilo del polígono
//     var greenPolygonStyle = {
//         'fill-color': '#FF0000', // Relleno verde
//         'fill-opacity': 0.7, // Opacidad del relleno
//         'fill-outline-color': '#FF0000', // Borde verde
//     };

//     // Configurar el modo de dibujo del polígono con el estilo personalizado
//     draw.changeMode('draw_polygon', {
//         defaultMode: 'simple_select',
//         polygon: {
//             ...draw.options.modes.draw_polygon,
//             userProperties: true, // Permite propiedades de usuario personalizadas
//             style: greenPolygonStyle // Aplica el estilo personalizado al polígono
//         }
//     });
// });

function printMapState() {
    // Obtener el centro actual del mapa
    var center = map.getCenter();

    // Obtener el nivel de zoom actual del mapa
    var zoom = map.getZoom();

    // Obtener la rotación actual del mapa
    var rotation = map.getBearing();

    // Imprimir los valores en la consola
    console.log('Centro del mapa:', center);
    console.log('Nivel de zoom:', zoom);
    console.log('Rotación:', rotation);
}
// Movemos el mapa con teclado usando step y panBy
document.addEventListener('keydown',function(e){
    switch (e.key) {
        case 'ArrowUp':
          map.panBy([0, -step], { duration: 0 });
          break;
        case 'ArrowDown':
          map.panBy([0, step], { duration: 0 });
          break;
        case 'ArrowLeft':
          map.panBy([-step, 0], { duration: 0 });
          break;
        case 'ArrowRight':
          map.panBy([step, 0], { duration: 0 });
          break;
      }
   
})

document.addEventListener('keyup',printMapState); // al presionar una tecla imrpimirá centro, zoom y rotation

var options = {
    zoom: 15.2, // Nivel de zoom deseado
    bearing:rotate_degrees, // Rotación deseada en grados
    animate: false // Desactiva cualquier animación
};

// Manejador de eventos para las teclas del teclado
document.addEventListener('keydown', function(event) {
    // Verifica si la tecla presionada es la "q"
    if (event.key === 'r') {
        // Mueve el mapa a una nueva ubicación, por ejemplo:
        var newLocation = { lng: -73.0562434464141, lat: -36.83918204471494 }; // Nueva ubicación de ejemplo
        map.panTo(newLocation, options); // Mueve el mapa a la nueva ubicación
    }
    if(event.key ==='l'){
        var newLocation = { lng:-73.06524475104834, lat: 
            -36.824897380157864 }; // Nueva ubicación de ejemplo
        map.panTo(newLocation, options); // Mueve el mapa a la nueva ubicación
    }
});
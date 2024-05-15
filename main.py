from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from asyncio import sleep
import hermes as hs
import requests


app = FastAPI()

#Las lineas que contienen h usan la librería del Diego para acceder a la base de datos
#h = hs.Handler()

#h.server_address = "http://clbb-api:8001"
app.mount("/static", StaticFiles(directory="static"), name="static")
#app.mount("/static/js", StaticFiles(directory="static/js"), name="js")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

websocket_connections = set()
conn_websocket_connections = set()

@app.get("/")
async def get_index():
    return FileResponse("index.html")

@app.post("/conn")
async def conn(response: dict):
    global conn_websocket_connections
    valor = response
    conn_websocket_connections = websocket_connections.copy()
    #Las siguientes líneas son para acceder a la base de datos con algún hash
    #aoi = h.load_amenities()
    #paths = h.load_indicator_data('am_prox_by_node_points', '36399181abbf6087c5e3f77d806fae31e7179cda90967acb64abfb981ab0551c')
    #print(paths)
    #print(paths.loc[:,0])
    #for connection in conn_websocket_connections:
    #    await connection.send_json(aoi.to_json())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Aceptar la conexión WebSocket
    await websocket.accept()
    
    # Agregar la conexión WebSocket a la lista general
    websocket_connections.add(websocket)

    try:
        # Bucle para manejar mensajes entrantes
        while True:
            # Leer mensaje del cliente
            data = await websocket.receive_json()
            # Enviar mensaje a todos los clientes conectados
            for connection in conn_websocket_connections:
                await connection.send_json(data)
    finally:
        # Eliminar la conexión WebSocket cuando se cierra
        websocket_connections.remove(websocket)
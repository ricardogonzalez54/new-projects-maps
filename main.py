from fastapi import FastAPI, WebSocket, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import json

# Define el modelo de datos para la base de datos
Base = declarative_base()

class GeoJSONFeature(BaseModel):
    type: str
    geometry: dict
    properties: dict

class GeoJSONFeatureDB(Base):
    __tablename__ = 'geojson_features'

    id = Column(Integer, primary_key=True, index=True)
    geometry = Column(Text)
    properties = Column(Text)

# Configura la conexión a la base de datos PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://UserName:password@localhost/nobre_base_datos"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Función para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Monta directorio estático para servir archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Definición de conexiones WebSocket
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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            for connection in conn_websocket_connections:
                await connection.send_json(data)
    finally:
        websocket_connections.remove(websocket)

# Modificación del endpoint para guardar en la base de datos
@app.post("/receive-geojson")
async def receive_geojson(feature: GeoJSONFeature, db: Session = Depends(get_db)):
    print("Datos GeoJSON recibidos:")
    print(feature)

    db_feature = GeoJSONFeatureDB(geometry=json.dumps(feature.geometry), properties=json.dumps(feature.properties))
    db.add(db_feature)
    db.commit()

    geojson_str = feature.json()

    with open("geojson_data.json", "w") as json_file:
        json_file.write(geojson_str)

    return {"message": "Datos GeoJSON exportados correctamente"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5353)
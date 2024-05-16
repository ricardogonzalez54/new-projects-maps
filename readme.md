# Inicializar la BDD

- Descargar PostgreSQL
- En el StackBuilder instalar "PostGis" en el apartado de "Spatial Extensions"
- Abrir pgAdmin4
- Crear una nueva DataBase(Click derecho en Databases-> Create-> Database)
- Hacer la siguiente Query en esta nueva DB (Click derecho en tu base de datos-> Query Tool-> Pegar el siguiente codigo):
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE geojson_features (
    id SERIAL PRIMARY KEY,
    geometry GEOMETRY,
    properties TEXT
);
- Modificar la linea 27 del archivo "main.py" para colocar tus respectivos nombre de usuario (postgres por defecto), contraseña y nombre de la base de datos que creaste.
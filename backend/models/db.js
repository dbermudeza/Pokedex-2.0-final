const Database = require('better-sqlite3');
const db = new Database('./db/pokemones.db');

// Crear tabla usuario
db.prepare(`
  CREATE TABLE IF NOT EXISTS usuario (
    id VARCHAR(20) PRIMARY KEY,
    correo VARCHAR(50) NOT NULL CHECK (correo LIKE '%@%'),
    nombre VARCHAR(20) NOT NULL,
    apellidos VARCHAR(30) NOT NULL,
    contraseña_hash TEXT NOT NULL,
    genero VARCHAR(5),
    fecha_nacimiento DATE
  );
`).run();

// Crear tabla pokemon
db.prepare(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    altura INTEGER NOT NULL,
    peso INTEGER NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    habilidad VARCHAR(20) NOT NULL,
    genero VARCHAR(5) NOT NULL CHECK (genero IN ('M', 'F')),
    ruta_imagen VARCHAR(100) NOT NULL,
    ruta_ubicacion VARCHAR(100) NOT NULL,
    id_usuario VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
  );
`).run();

// Crear tabla favorito
db.prepare(`
  CREATE TABLE IF NOT EXISTS favorito (
    id_usuario VARCHAR(20),
    id_pokemon INTEGER,
    PRIMARY KEY (id_usuario, id_pokemon),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (id_pokemon) REFERENCES pokemon(id) ON DELETE CASCADE
  );
`).run();

// Crear tabla tipo
db.prepare(`
  CREATE TABLE IF NOT EXISTS tipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(20) NOT NULL
  );
`).run();

// Crear tabla pokemon_tipo
db.prepare(`
  CREATE TABLE IF NOT EXISTS pokemon_tipo (
    id_tipo INTEGER,
    id_pokemon INTEGER,
    PRIMARY KEY (id_tipo, id_pokemon),
    FOREIGN KEY (id_tipo) REFERENCES tipo(id),
    FOREIGN KEY (id_pokemon) REFERENCES pokemon(id)
  );
`).run();

module.exports = db;

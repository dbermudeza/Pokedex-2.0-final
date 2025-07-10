const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Para subir archivos
const bcrypt = require('bcryptjs'); // <--- Importa bcrypt
const jwt = require('jsonwebtoken'); // <--- Importa jsonwebtoken
const path = require('path');     // Para manejar rutas de archivos
const db = require('./models/db');  // Tu conexión (parece ser better-sqlite3)

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
// Middleware para servir las imágenes que se suban
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Configuración de Multer para guardar archivos ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
  },
  filename: function (req, file, cb) {
    // Nombre de archivo único para evitar que se sobreescriban
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// --- Rutas ---

// Tu ruta para OBTENER todos los pokemones (ya la tenías)
// --- RUTA MEJORADA PARA OBTENER POKÉMONES ---
app.get('/api/pokemones', (req, res) => {
    const { userId } = req.query;

    // 1. LA CONSULTA SQL AHORA UNE LAS 3 TABLAS
    // GROUP_CONCAT une todos los nombres de los tipos en un solo string separado por comas.
    const baseQuery = `
        SELECT 
            p.*, 
            GROUP_CONCAT(t.nombre) AS tipos
        FROM 
            pokemon p
        LEFT JOIN 
            pokemon_tipo pt ON p.id = pt.id_pokemon
        LEFT JOIN 
            tipo t ON pt.id_tipo = t.id
    `;

    let sql;
    let params = [];

    // La lógica para filtrar por usuario sigue siendo la misma
    if (userId) {
        sql = `${baseQuery} WHERE p.id_usuario IS NULL OR p.id_usuario = ? GROUP BY p.id`;
        params.push(userId);
    } else {
        sql = `${baseQuery} WHERE p.id_usuario IS NULL GROUP BY p.id`;
    }

    try {
        const pokemones = db.prepare(sql).all(params);
        
        // 2. PROCESAR EL RESULTADO PARA EL FRONTEND
        // El resultado de GROUP_CONCAT es un string como "Fuego,Volador".
        // Lo convertimos en un array como ["Fuego", "Volador"].
        const pokemonesConTiposEnArray = pokemones.map(p => {
            return {
                ...p,
                // Si un pokémon no tiene tipos, p.tipos será NULL.
                // Lo manejamos para que devuelva un array vacío en ese caso.
                type: p.tipos ? p.tipos.split(',') : [] 
            };
        });

        res.json(pokemonesConTiposEnArray);

    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
});

    const insertPokemonTransaction = db.transaction((pokemonData) => {
        const { 
            nombre, descripcion, altura, peso, categoria, habilidad, genero, 
            tipos, userId, pokemonImagePath, locationImagePath 
        } = pokemonData;

        // 1. Convertir el valor del género a 'M' o 'F'
        let generoParaDB;
        if (genero && genero.toLowerCase() === 'masculino') {
            generoParaDB = 'M';
        } else if (genero && genero.toLowerCase() === 'femenino') {
            generoParaDB = 'F';
        } else {
            generoParaDB = null; // Asignar NULL si no es ninguno
        }

        // 2. Insertar los datos principales en la tabla 'pokemon'
        const pokemonSql = `INSERT INTO pokemon (nombre, descripcion, altura, peso, categoria, habilidad, genero, ruta_imagen, ruta_ubicacion, id_usuario)
                            VALUES (@nombre, @descripcion, @altura, @peso, @categoria, @habilidad, @genero, @ruta_imagen, @ruta_ubicacion, @id_usuario)`;
        
        const pokemonStmt = db.prepare(pokemonSql);
        const info = pokemonStmt.run({
            nombre,
            descripcion,
            altura,
            peso,
            categoria,
            habilidad,
            genero: generoParaDB, // Se usa la variable convertida
            ruta_imagen: pokemonImagePath,
            ruta_ubicacion: locationImagePath,
            id_usuario: userId
        });

        const newPokemonId = info.lastInsertRowid;

        // 3. Insertar las relaciones en la tabla 'pokemon_tipo'
        if (tipos && tipos.length > 0) {
            const selectTypeStmt = db.prepare('SELECT id FROM tipo WHERE nombre = ?');
            const insertPokemonTypeStmt = db.prepare('INSERT INTO pokemon_tipo (id_pokemon, id_tipo) VALUES (?, ?)');

            for (const tipoNombre of tipos) {
                const tipoRow = selectTypeStmt.get(tipoNombre);
                if (tipoRow) { // Asegurarse que el tipo existe
                    insertPokemonTypeStmt.run(newPokemonId, tipoRow.id);
                }
            }
        }

        return { id: newPokemonId };
    });

// NUEVA RUTA para AÑADIR un pokémon con imágenes
app.post('/api/pokemon', upload.fields([
    { name: 'pokemonImage', maxCount: 1 },
    { name: 'locationImage', maxCount: 1 }
]), (req, res) => {
    try {
        // Extraer y parsear los tipos, que vienen como un string JSON
        const { tipos, ...otherData } = req.body;
        const parsedTipos = JSON.parse(tipos || '[]');

        // Obtener las rutas de las imágenes guardadas por multer
        const pokemonImagePath = req.files.pokemonImage ? req.files.pokemonImage[0].path : null;
        const locationImagePath = req.files.locationImage ? req.files.locationImage[0].path : null;

        // Ejecutar la transacción con todos los datos
        const result = insertPokemonTransaction({
            ...otherData,
            tipos: parsedTipos,
            pokemonImagePath,
            locationImagePath,
        });

        res.status(201).json({ id: result.id, message: "Pokémon añadido con éxito" });
    } catch (err) {
        // Si algo falla en la transacción, se revierte automáticamente
        res.status(400).json({ "error": err.message });
    }
});

// --- RUTA DE LOGIN MEJORADA (acepta correo o usuario) ---
app.post('/api/login', (req, res) => {
    // 1. Obtener el identificador (puede ser correo o id) y la contraseña
    const { identifier, password } = req.body;

    // 2. Modificar la consulta SQL para buscar en ambas columnas
    const sql = 'SELECT * FROM usuario WHERE id = ? OR correo = ?';
    
    try {
        // 3. Ejecutar la consulta pasando el identificador para ambos parámetros
        const user = db.prepare(sql).get(identifier, identifier);

        // 4. Si el usuario no existe, enviar un error
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 5. Comparar la contraseña (el resto de la lógica no cambia)
        const isPasswordCorrect = bcrypt.compareSync(password, user.contraseña_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 6. Crear y enviar el token si todo es correcto
        const payload = { id: user.id, nombre: user.nombre };
        const token = jwt.sign(payload, 'TU_CLAVE_SECRETA_SUPER_DIFICIL', { expiresIn: '1h' });

        res.json({
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo
            }
        });

    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
});

// --- NUEVA RUTA DE REGISTRO ---

app.post('/api/register', (req, res) => {
    const { id, correo, nombre, apellidos, password, genero, fecha_nacimiento } = req.body;

    // 1. Validar que los datos esenciales no estén vacíos
    if (!id || !correo || !password) {
        return res.status(400).json({ error: 'El usuario, correo y contraseña son requeridos.' });
    }

    try {
        // 2. Comprobar si el ID (username) o el correo ya existen
        const checkUserSql = 'SELECT id, correo FROM usuario WHERE id = ? OR correo = ?';
        const existingUser = db.prepare(checkUserSql).get(id, correo);

        if (existingUser) {
            if (existingUser.id === id) {
                return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' }); // 409 Conflict
            }
            if (existingUser.correo === correo) {
                return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
            }
        }

        // 3. Si no existen, encriptar la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        // 4. Insertar el nuevo usuario en la base de datos
        const insertSql = `INSERT INTO usuario (id, correo, nombre, apellidos, contraseña_hash, genero, fecha_nacimiento)
                           VALUES (@id, @correo, @nombre, @apellidos, @contraseña_hash, @genero, @fecha_nacimiento)`;
        
        db.prepare(insertSql).run({
            id,
            correo,
            nombre,
            apellidos,
            contraseña_hash: hashedPassword,
            genero,
            fecha_nacimiento
        });

        // 5. Crear un Token (JWT) para iniciar sesión automáticamente
        const payload = { id: id, nombre: nombre };
        const token = jwt.sign(payload, 'TU_CLAVE_SECRETA_SUPER_DIFICIL', { expiresIn: '1h' });

        // 6. Enviar el token y los datos del nuevo usuario
        res.status(201).json({
            message: 'Registro exitoso',
            token: token,
            user: { id, nombre, correo }
        });

    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
});


app.listen(5000, () => console.log('Servidor corriendo en http://localhost:5000'));
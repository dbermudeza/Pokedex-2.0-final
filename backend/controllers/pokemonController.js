const db = require('../models/db');

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

exports.getPokemons = (req, res) => {
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
        const pokemonesConTiposEnArray = pokemones.map(p => {
            return {
                ...p,
                type: p.tipos ? p.tipos.split(',') : [] 
            };
        });
        res.json(pokemonesConTiposEnArray);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
};

exports.createPokemons = (req, res) => {
    try {
        const { tipos, ...otherData } = req.body;
        const parsedTipos = JSON.parse(tipos || '[]');
        const pokemonImagePath = req.files.pokemonImage ? req.files.pokemonImage[0].path : null;
        const locationImagePath = req.files.locationImage ? req.files.locationImage[0].path : null;

        const result = insertPokemonTransaction({
            ...otherData,
            tipos: parsedTipos,
            pokemonImagePath,
            locationImagePath,
        });

        res.status(201).json({ id: result.id, message: "Pokémon añadido con éxito" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
};
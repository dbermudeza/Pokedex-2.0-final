const db = require('../models/db');

const insertPokemonTransaction = db.transaction((pokemonData) => {
    console.log("📦 Datos recibidos para insertar Pokémon:", pokemonData);
  const { 
    nombre, descripcion, altura, peso, categoria, habilidad, genero, 
    tipos, userId, pokemonImagePath, locationImagePath,
    id_pokemon_evolucion = null,   // Valor por defecto
    id_pokemon_involucion = null   // Valor por defecto
  } = pokemonData;

  let generoParaDB;
    if (genero && genero.toLowerCase() === 'masculino') {
        generoParaDB = 'M';
    } else if (genero && genero.toLowerCase() === 'femenino') {
        generoParaDB = 'F';
    } else {
        generoParaDB = null; // Asignar NULL si no es ninguno
    }


  const sql = `
    INSERT INTO pokemon (
      nombre, descripcion, altura, peso, categoria, habilidad, genero,
      ruta_imagen, ruta_ubicacion,
      id_pokemon_evolucion, id_pokemon_involucion, id_usuario
    ) VALUES (
      @nombre, @descripcion, @altura, @peso, @categoria, @habilidad, @genero,
      @ruta_imagen, @ruta_ubicacion,
      @id_pokemon_evolucion, @id_pokemon_involucion, @id_usuario
    )
  `;
  const stmt = db.prepare(sql);
  const info = stmt.run({
    nombre,
    descripcion,
    altura,
    peso,
    categoria,
    habilidad,
    genero: generoParaDB,
    ruta_imagen: pokemonImagePath,
    ruta_ubicacion: locationImagePath,
    id_pokemon_evolucion,    // puede ser null
    id_pokemon_involucion,   // puede ser null
    id_usuario: userId
  });

  const newPokemonId = info.lastInsertRowid;

  if (id_pokemon_involucion) {
    db.prepare(`
      UPDATE pokemon
      SET id_pokemon_evolucion = ?
      WHERE id = ?
    `).run(newPokemonId, id_pokemon_involucion);
  }

  // 3) Si el usuario eligió una evolución, actualiza el Pokémon hijo
  if (id_pokemon_evolucion) {
    db.prepare(`
      UPDATE pokemon
      SET id_pokemon_involucion = ?
      WHERE id = ?
    `).run(newPokemonId, id_pokemon_evolucion);
  }

  // Insertar las relaciones en la tabla 'pokemon_tipo'
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



exports.getUserPokemons = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'userId es requerido' });
  }

  const sql = `SELECT * FROM pokemon WHERE id_usuario = ?`;

  try {
    // Ejecuta la consulta
    const pokemones = db.prepare(sql).all(userId);

    // Depura por consola lo que devuelve SQLite
    console.log(`getUserPokemons para userId=${userId}:`, pokemones);

    // Envía la respuesta
    res.json(pokemones);
  } catch (err) {
    console.error('Error en getUserPokemons:', err);
    res.status(500).json({ error: 'Error al obtener pokemones del usuario: ' + err.message });
  }
};

exports.getUserPokemonsNoEvolution = (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId es requerido' });

  try {
    const sql = `
      SELECT * FROM pokemon
      WHERE id_usuario = ?
        AND id_pokemon_involucion IS NULL
    `;
    const pokes = db.prepare(sql).all(userId);
    return res.json(pokes);
  } catch (err) {
    console.error('Error en getUserPokemonsNoEvolution:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserPokemonsNoInvolution = (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId es requerido' });

  try {
    const sql = `
      SELECT * FROM pokemon
      WHERE id_usuario = ?
        AND id_pokemon_evolucion IS NULL
    `;
    const pokes = db.prepare(sql).all(userId);
    return res.json(pokes);
  } catch (err) {
    console.error('Error en getUserPokemonsNoInvolution:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getPokemons = (req, res) => {
    const { userId } = req.query;
    
    console.log(`getPokemons llamado con userId: ${userId}`);

    // Consulta SQL que incluye información de favoritos
    const baseQuery = `
        SELECT 
            p.*, 
            GROUP_CONCAT(t.nombre) AS tipos,
            CASE WHEN f.id_usuario IS NOT NULL THEN 1 ELSE 0 END AS favorito
        FROM 
            pokemon p
        LEFT JOIN 
            pokemon_tipo pt ON p.id = pt.id_pokemon
        LEFT JOIN 
            tipo t ON pt.id_tipo = t.id
        LEFT JOIN 
            favorito f ON p.id = f.id_pokemon AND f.id_usuario = ?
    `;

    let sql;
    let params = [];

    // La lógica para filtrar por usuario sigue siendo la misma
    if (userId) {
        sql = `${baseQuery} WHERE p.id_usuario IS NULL OR p.id_usuario = ? GROUP BY p.id ORDER BY p.id`;
        params.push(userId, userId);
    } else {
        sql = `${baseQuery} WHERE p.id_usuario IS NULL GROUP BY p.id ORDER BY p.id`;
        params.push(null);
    }

    console.log(`SQL Query: ${sql}`);
    console.log(`Params: ${JSON.stringify(params)}`);

    try {
        const pokemones = db.prepare(sql).all(params);
        console.log(`Pokémons encontrados: ${pokemones.length}`);
        console.log(`IDs de pokémons: ${pokemones.map(p => p.id).sort((a, b) => a - b)}`);
        
        const pokemonesConTiposEnArray = pokemones.map(p => {
            return {
                ...p,
                type: p.tipos ? p.tipos.split(',') : [],
                favorito: !!p.favorito
            };
        });
        res.json(pokemonesConTiposEnArray);
    } catch (err) {
        console.error('❌ Error en getPokemons:', err);
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

// Endpoint para agregar/quitar favorito
exports.toggleFavorite = (req, res) => {
    const { userId, pokemonId } = req.body;

    if (!userId || !pokemonId) {
        return res.status(400).json({ error: 'userId y pokemonId son requeridos' });
    }

    try {
        // Verificar si ya existe el favorito
        const existingFavorite = db.prepare('SELECT * FROM favorito WHERE id_usuario = ? AND id_pokemon = ?').get(userId, pokemonId);

        if (existingFavorite) {
            // Si existe, lo elimina
            db.prepare('DELETE FROM favorito WHERE id_usuario = ? AND id_pokemon = ?').run(userId, pokemonId);
            res.json({ isFavorite: false, message: 'Removido de favoritos' });
        } else {
            // Si no existe, lo agrega
            db.prepare('INSERT INTO favorito (id_usuario, id_pokemon) VALUES (?, ?)').run(userId, pokemonId);
            res.json({ isFavorite: true, message: 'Agregado a favoritos' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
};

// Endpoint para obtener favoritos de un usuario
exports.getFavorites = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
    }

    try {
        const favorites = db.prepare('SELECT id_pokemon FROM favorito WHERE id_usuario = ?').all(userId);
        const favoriteIds = favorites.map(fav => fav.id_pokemon);
        res.json({ favorites: favoriteIds });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
};
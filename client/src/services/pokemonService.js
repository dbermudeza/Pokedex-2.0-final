const API_BASE_URL = 'http://localhost:5000/api';

export const pokemonService = {
  // Obtener todos los pokémon con información de favoritos para un usuario
  async getAllPokemons(userId = null, forceRefresh = false) {
    try {
      let url = `${API_BASE_URL}/pokemones`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      
      // Agregar timestamp para evitar caché del navegador
      if (forceRefresh) {
        url += (url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
      }
      
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      
      console.log('📊 API response:', data.length, 'pokemons');
      
      return data;
    } catch (error) {
      console.error('Error al obtener pokémons:', error);
      throw error;
    }
  },

  // Obtener un pokémon específico por ID
  async getPokemonById(id, userId = null) {
    try {
      // Siempre obtener datos frescos para evitar problemas de caché
      const allPokemons = await this.getAllPokemons(userId);
      const pokemon = allPokemons.find(p => p.id === parseInt(id));
      
      if (!pokemon) {
        console.warn(`Pokémon con ID ${id} no encontrado en la lista de ${allPokemons.length} pokémons`);
        console.log('IDs disponibles:', allPokemons.map(p => p.id).sort((a, b) => a - b));
      }
      
      return pokemon;
    } catch (error) {
      console.error(`Error al obtener pokémon con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener pokémons de un usuario específico
  async getUserPokemons(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/pokemones`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener pokémons del usuario:', error);
      throw error;
    }
  },

  // Alternar favorito
  async toggleFavorite(userId, pokemonId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pokemonId }),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al alternar favorito:', error);
      throw error;
    }
  },

  // Obtener favoritos de un usuario
  async getFavorites(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${userId}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data.favorites || [];
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      throw error;
    }
  },

  // Crear un nuevo pokémon
  async createPokemon(pokemonData, pokemonImage, locationImage) {
    try {
      const formData = new FormData();
      
      // Agregar los datos del pokémon
      Object.keys(pokemonData).forEach(key => {
        if (key === 'tipos') {
          formData.append('tipos', JSON.stringify(pokemonData[key]));
        } else {
          formData.append(key, pokemonData[key]);
        }
      });

      // Agregar las imágenes
      if (pokemonImage) {
        formData.append('pokemonImage', pokemonImage);
      }
      if (locationImage) {
        formData.append('locationImage', locationImage);
      }

      const response = await fetch(`${API_BASE_URL}/pokemon`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al crear pokémon:', error);
      throw error;
    }
  }
};

// Utilidad para obtener la línea evolutiva completa de un Pokémon
export const getEvolutionLineForPokemon = (pokemonId, allPokemons) => {
  const pokemon = allPokemons.find(p => p.id === pokemonId);
  if (!pokemon) return [];
  
  // Construir la línea evolutiva completa
  const evolutionLine = [];
  
  // Encontrar el Pokémon base (que no tiene pre-evolución)
  let basePokemon = pokemon;
  const visited = new Set(); // Para evitar bucles infinitos
  
  // Buscar hacia atrás hasta encontrar la base
  while (basePokemon.id_pokemon_involucion && !visited.has(basePokemon.id)) {
    visited.add(basePokemon.id);
    const prevPokemon = allPokemons.find(p => p.id === basePokemon.id_pokemon_involucion);
    if (prevPokemon) {
      basePokemon = prevPokemon;
    } else {
      break;
    }
  }
  
  // Construir la línea desde la base hacia adelante
  let currentPokemon = basePokemon;
  const forwardVisited = new Set();
  
  while (currentPokemon && !forwardVisited.has(currentPokemon.id)) {
    forwardVisited.add(currentPokemon.id);
    evolutionLine.push(currentPokemon.id);
    
    // Buscar la siguiente evolución
    const nextPokemon = allPokemons.find(p => p.id === currentPokemon.id_pokemon_evolucion);
    currentPokemon = nextPokemon;
  }
  
  // Si no se encontró una línea evolutiva, devolver solo el Pokémon actual
  return evolutionLine.length > 0 ? evolutionLine : [pokemonId];
};

// Utilidad para formatear la URL de la imagen
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/pokeball.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
};

// Utilidad específica para formatear la URL de la imagen del hábitat
export const getHabitatImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/pokemonmap.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
};

// Utilidad para mapear tipos de la base de datos a los que espera el frontend
export const mapPokemonData = (pokemonFromDB) => {
  return {
    id: pokemonFromDB.id,
    name: pokemonFromDB.nombre,
    dexNumber: String(pokemonFromDB.id).padStart(3, '0'),
    type: pokemonFromDB.type || [],
    sprite: getImageUrl(pokemonFromDB.ruta_imagen),
    category: pokemonFromDB.categoria,
    height: pokemonFromDB.altura ? `${pokemonFromDB.altura} m` : '??? m',
    weight: pokemonFromDB.peso ? `${pokemonFromDB.peso} kg` : '??? kg',
    description: pokemonFromDB.descripcion || 'Sin descripción disponible.',
    habilities: pokemonFromDB.habilidad ? [pokemonFromDB.habilidad] : [],
    gender: pokemonFromDB.genero === 'M' ? ['male'] : pokemonFromDB.genero === 'F' ? ['female'] : ['male', 'female'],
    discovered: true,
    favorito: pokemonFromDB.favorito || false,
    evolution: [], // Por ahora vacío, se puede implementar después
    habitat: getHabitatImageUrl(pokemonFromDB.ruta_ubicacion),
    // Datos adicionales de la BD - IMPORTANTE: incluir datos de evolución
    userId: pokemonFromDB.id_usuario,
    id_pokemon_evolucion: pokemonFromDB.id_pokemon_evolucion,
    id_pokemon_involucion: pokemonFromDB.id_pokemon_involucion,
  };
};

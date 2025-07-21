// Hook personalizado para manejar la conexión con la API
import { useState, useEffect } from 'react';
import { pokemonService } from '../services/pokemonService';

export const usePokemonData = (userId = null) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPokemons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pokemonService.getAllPokemons(userId);
      setPokemons(data);
    } catch (err) {
      console.error('Error fetching pokemons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, [userId]);

  const refreshPokemons = () => {
    fetchPokemons();
  };

  return {
    pokemons,
    loading,
    error,
    refreshPokemons
  };
};

export const usePokemonDetail = (pokemonId, userId = null) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await pokemonService.getPokemonById(pokemonId, userId);
        setPokemon(data);
      } catch (err) {
        console.error('Error fetching pokemon:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (pokemonId) {
      fetchPokemon();
    }
  }, [pokemonId, userId]);

  return {
    pokemon,
    loading,
    error
  };
};

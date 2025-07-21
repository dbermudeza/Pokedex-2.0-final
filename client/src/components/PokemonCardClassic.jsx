import React, {useState } from 'react';
import './PokemonCardClassic.css';

const PokemonCardClassic = ({ pokemon, className = ''}) => {
  // Usamos 'sprite' que viene del servicio mapeado, o ruta_imagen como fallback
  const imageUrl = pokemon.sprite || pokemon.ruta_imagen 
    ? (pokemon.sprite || `http://localhost:5000/${pokemon.ruta_imagen}`)
    : "/assets/pokeball.png";

  const [highlightedId, setHighlightedId] = useState(null); 
  return (
    <div className={`pokemon-card ${className}`}>
      <div className="card-left">
        {/* Usamos 'id' o 'dexNumber' si está disponible */}
        <span className="poke-id">#{(pokemon.dexNumber || pokemon.id.toString().padStart(3, '0'))}</span>
        
        {/* Usamos la URL de la imagen construida */}
        <img src={imageUrl} alt={pokemon.name || pokemon.nombre || 'Pokémon'} className="poke-img" />
      </div>
      <div className="card-right">
        <span className="poke-name">
          {/* Usamos 'name' (formato mapeado) o 'nombre' como fallback */}
          {pokemon.name || pokemon.nombre || '???'}
        </span>
      </div>
    </div>
  );
};

export default PokemonCardClassic;
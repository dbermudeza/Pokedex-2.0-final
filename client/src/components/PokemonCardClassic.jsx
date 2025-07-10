import React from 'react';
import './PokemonCardClassic.css';

const PokemonCardClassic = ({ pokemon }) => {
  // Construimos la URL completa para la imagen del backend
  const imageUrl = pokemon.ruta_imagen 
    ? `http://localhost:5000/${pokemon.ruta_imagen}` 
    : "/assets/pokeball.png";

  return (
    // Se elimina la dependencia de 'discovered'
    <div className={`pokemon-card`}>
      <div className="card-left">
        {/* Usamos 'id' que sí existe */}
        <span className="poke-id">#{pokemon.id.toString().padStart(3, '0')}</span>
        
        {/* Usamos la URL de la imagen construida */}
        <img src={imageUrl} alt={pokemon.nombre || 'Pokémon'} className="poke-img" />
      </div>
      <div className="card-right">
        <span className="poke-name">
          {/* Usamos 'nombre' en lugar de 'name' */}
          {pokemon.nombre || '???'}
        </span>
      </div>
    </div>
  );
};

export default PokemonCardClassic;
import React from "react";
import "./PokemonCardGeneral.css";

const PokemonCardGeneral = ({ pokemon }) => {
  // El backend ya nos da la propiedad 'type' como un array
  const types = pokemon.type || [];

  // Construimos la URL completa para la imagen
  const imageUrl = pokemon.ruta_imagen 
    ? `http://localhost:5000/${pokemon.ruta_imagen}` 
    : "/assets/pokeball.png";

  return (
    // Eliminamos la dependencia de 'discovered'
    <div className={`pokemon-card-regular`}>
      {/* Usamos 'id' que sí existe */}
      <div className="poke-number">#{pokemon.id.toString().padStart(3, '0')}</div>
      
      {/* Usamos la URL construida */}
      <img src={imageUrl} alt={pokemon.nombre || 'Pokémon'} className="poke-img" />
      
      <div className="poke-name">
        {/* Usamos 'nombre' en lugar de 'name' */}
        {pokemon.nombre || '???'}
      </div>
      
      <div className="poke-types">
        {types.map((type) => (
          <div key={type} className={`poke-type ${type}`}>
            {type}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonCardGeneral;
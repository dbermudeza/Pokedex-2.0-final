import pokemons from './pokemons';

const user = {
  username: 'ashketchum',
  password: 'pikachu123', // ¡En producción nunca guardes contraseñas en texto plano!
  pokemons: pokemons.map(p => ({ ...p })), // Copia profunda de los Pokémon
};

export default user;
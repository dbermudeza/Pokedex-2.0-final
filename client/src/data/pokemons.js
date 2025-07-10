const pokemons = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  switch (id) {
    case 1:
      return {
        id,
        name: 'Bulbasaur',
        type: ['Planta', 'Veneno'],
        sprite: '/assets/bulbasaur.png',
        category: 'Semilla',
        dexNumber: '001',
        height: '0.7 m',
        weight: '6.9 kg',
        description: "Este Pokémon nace con una semilla en el lomo. Con el tiempo, la semilla brota.",
        habilities: ['Espesura', 'Clorofila'],
        evolution: [2, 3],
        discovered: true,
        gender: ["male", "female"],
        favorito:true,
      };
    case 2:
      return {
        id,
        name: 'Ivysaur',
        type: ['Planta', 'Veneno'],
        sprite: '/assets/ivysaur.png',
        category: 'Semilla',
        dexNumber: '002',
        height: '1.0 m',
        weight: '13.0 kg',
        description: "Cuando la flor en su lomo florece, se dice que es un buen momento para entrenar.",
        habilities: ['Espesura', 'Clorofila'],
        evolution: [1, 3],
        discovered: true,
        gender: ["male", "female"],
        favorito:false,
      };
    case 4:
      return {
        id,
        name: 'Charmander',
        type: ['Fuego'],
        sprite: '/assets/charmander.png',
        category: 'Lagartija',
        dexNumber: '004',
        height: '0.6 m',
        weight: '8.5 kg',
        description: "Este Pokémon tiene una llama en la punta de su cola que indica su salud y estado emocional.",
        habilities: ['Mar Llamas', 'Poder solar'],
        evolution: [5, 6],
        discovered: true,
        gender: ["male", "female"],
        favorito:true,
      };
    case 5:
      return {
        id,
        name: 'Charmeleon',
        type: ['Fuego'],
        sprite: '/assets/charmeleon.png',
        category: 'Lagartija',
        dexNumber: '005',
        height: '1.1 m',
        weight: '19.0 kg',
        description: "Cuando está enfadado, la llama en su cola arde más intensamente.",
        habilities: ['Mar Llamas', 'Poder solar'],
        evolution: [4, 6],
        discovered: true,
        gender: ["male", "female"],
        favorito:false,
      };
    case 7:
      return {
        id,
        name: 'Squirtle',
        type: ['Agua'],
        sprite: '/assets/squirtle.png',
        category: 'Tortuga',
        dexNumber: '007',
        height: '0.5 m',
        weight: '9.0 kg',
        description: "Este Pokémon es conocido por su caparazón duro y su habilidad para nadar.",
        habilities: ['Torrente', 'Cura lluvia'],
        evolution: [8, 9],
        discovered: true,
        gender: ["male", "female"],
        favorito:false,
      };
    default:
      return {
        id,
        name: null,
        type: [],
        sprite: null,
        discovered: false,
        gender: [],

      };
  }
});

//La información de los Pokémon se deja grabada en el codigo ya que no se dispone de un backend para obtenerla dinámicamente en esta entrega.

export default pokemons;
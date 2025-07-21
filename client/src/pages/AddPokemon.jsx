import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pinIcon from '../assets/pin.png';
import evolutionIcon from '../assets/evolution.png';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import PokemonCardClassic from '../components/PokemonCardClassic';
import './AuthForms.css';
import './AddPokemon.css';



const AddPokemon = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [categoria, setCategoria] = useState('');
  const [habilidad, setHabilidad] = useState('');
  const [genero, setGenero] = useState('');
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [pokemonesUsuario, setPokemonesUsuario] = useState([]);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showInvolutionModal, setShowInvolutionModal] = useState(false);
  const [evolutionSeleccionada,   setEvolutionSeleccionada]   = useState(null);
  const [involutionSeleccionada,  setInvolutionSeleccionada]  = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);




  const inputRef1 = useRef(null);
  const imageViewRef1 = useRef(null);
  const imageEvolutionRef = useRef(null);

  const inputRef2 = useRef(null);
  const imageViewRef2 = useRef(null);

  const tiposDisponibles = [
    "Normal", "Fuego", "Agua", "Planta", "Eléctrico", "Hielo", "Lucha", "Veneno", "Tierra",
    "Volador", "Psíquico", "Bicho", "Roca", "Fantasma", "Dragón", "Siniestro", "Acero", "Hada"
  ];

  const agregarTipo = (e) => {
  const nuevoTipo = e.target.value;
  if (nuevoTipo && !tiposSeleccionados.includes(nuevoTipo)) {
    setTiposSeleccionados([...tiposSeleccionados, nuevoTipo]);
  }
  e.target.value = ""; // resetear selección
  };


  const eliminarTipo = (tipo) => {
    setTiposSeleccionados(tiposSeleccionados.filter(t => t !== tipo));
  };

const { isLoggedIn } = useAuth();
  const [idUsuario, setIdUsuario] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (isLoggedIn && storedUser) {
      const user = JSON.parse(storedUser);
      setIdUsuario(user.id);
    }
  }, [isLoggedIn]);


  useEffect(() => {
    const setupImageUpload = (inputRef, imageViewRef, optionalEvolutionRef) => {
      const input = inputRef.current;
      const imageView = imageViewRef.current;

      if (!input || !imageView) return;
      
      const handleChange = () => {
      const file = input.files[0];
      if (file && imageView) {
        const imgLink = URL.createObjectURL(file);

        if (imageView) {
          imageView.style.backgroundImage = `url(${imgLink})`;
          imageView.textContent = '';
          imageView.style.border = 'none';
        }

        if (optionalEvolutionRef && optionalEvolutionRef.current) {
          const evolution = optionalEvolutionRef.current;
          evolution.style.backgroundImage = `url(${imgLink})`;
          evolution.textContent = '';
          evolution.style.border = 'none';
        }
      }
    };

      const handleDrop = (e) => {
        e.preventDefault();
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const handleDragOver = (e) => e.preventDefault();

      input.addEventListener('change', handleChange);
      imageView.addEventListener('dragover', handleDragOver);
      imageView.addEventListener('drop', handleDrop);

      return () => {
        input.removeEventListener('change', handleChange);
        imageView.removeEventListener('dragover', handleDragOver);
        imageView.removeEventListener('drop', handleDrop);
      };
    };

    const cleanup1 = setupImageUpload(inputRef1, imageViewRef1, imageEvolutionRef);
    const cleanup2 = setupImageUpload(inputRef2, imageViewRef2);

    return () => {
      cleanup1();
      cleanup2();
    };

    
  }, []);

  useEffect(() => {
    if (showEvolutionModal && idUsuario) {
      fetch(`http://localhost:5000/api/usuarios/${idUsuario}/pokemones/no-evolution`)
        .then(res => res.json())
        .then(data => {
          // Si hay una involución seleccionada, la filtramos
          const dataFiltrada = involutionSeleccionada
            ? data.filter(p => p.id !== involutionSeleccionada.id)
            : data;
          setPokemonesUsuario(dataFiltrada);
        })
        .catch(err => console.error("Error al cargar Pokémon:", err));
    }
  }, [showEvolutionModal, idUsuario, involutionSeleccionada]);

  useEffect(() => {
    if (showInvolutionModal && idUsuario) {
      fetch(`http://localhost:5000/api/usuarios/${idUsuario}/pokemones/no-involution`)
        .then(res => res.json())
        .then(data => {
          // Si hay una evolución seleccionada, la filtramos
          const dataFiltrada = evolutionSeleccionada
            ? data.filter(p => p.id !== evolutionSeleccionada.id)
            : data;
          setPokemonesUsuario(dataFiltrada);
        })
        .catch(err => console.error("Error al cargar Pokémon:", err));
    }
  }, [showInvolutionModal, idUsuario, evolutionSeleccionada]);





  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Obtener el ID del usuario desde localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        alert('Error: No se pudo identificar al usuario. Por favor, inicie sesión.');
        return;
    }
    const userId = JSON.parse(storedUser).id;

    // Validar que los campos requeridos no estén vacíos
    if (!nombre || !descripcion || !altura || !peso || !categoria || !habilidad || !genero || !inputRef1.current.files[0] || !inputRef2.current.files[0]) {
        alert('Por favor, completa todos los campos obligatorios, incluyendo las imágenes.');
        return;
    }

    // Crear el FormData y añadir TODOS los datos
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('altura', altura);
    formData.append('peso', peso);
    formData.append('categoria', categoria);
    formData.append('habilidad', habilidad);
    formData.append('genero', genero);
    formData.append('tipos', JSON.stringify(tiposSeleccionados)); // Enviamos el array como un string JSON
    formData.append('userId', userId);
    if (evolutionSeleccionada) formData.append('id_pokemon_evolucion', evolutionSeleccionada.id);
    if (involutionSeleccionada) formData.append('id_pokemon_involucion', involutionSeleccionada.id);


    // Añade los archivos
    formData.append('pokemonImage', inputRef1.current.files[0]);
    formData.append('locationImage', inputRef2.current.files[0]);

    // Enviar la petición
    try {
      const response = await fetch('http://localhost:5000/api/pokemon', { 
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Si el backend envía un error, lo mostramos
        throw new Error(result.error || 'Error al añadir el Pokémon');
      }

      alert('¡Pokémon añadido con éxito!');
      
      // En lugar de usar navigate(-1), usar navigate con replace para forzar actualización
      // Esto asegura que la vista se recargue completamente
      navigate('/clasica', { replace: true });
      
    } catch (error) {
      console.error('Error en el fetch:', error);
      alert(error.message);
    }
  };

  return (
    
    <>
  {showEvolutionModal && (
    <div className="modal-overlay" onClick={() => setShowEvolutionModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Elegir evolución</h2>
        <div className="evo-list">
          {pokemonesUsuario.length === 0 ? (
            <p>No tienes Pokémon disponibles.</p>
          ) : (
            <>
              <button
                className="evo-card-btn cancel-option"
                onClick={() => {
                  setEvolutionSeleccionada(null);
                  setHighlightedId(null);
                  setShowEvolutionModal(false);
                }}
              >
                ❌ Ninguna evolución
              </button>
              {pokemonesUsuario.map(p => (
                <button
                  key={p.id}
                  className="evo-card-btn"
                  onClick={() => {
                    console.log("Evolución seleccionada:", p);
                    setEvolutionSeleccionada({ 
                      id: p.id, 
                      imagen: `http://localhost:5000/${p.ruta_imagen.replace(/\\/g, '/')}`
                    });
                    setHighlightedId(p.id);
                    setShowEvolutionModal(false);
                  }}
                >
                  <PokemonCardClassic 
                    pokemon={p} 
                    className={p.id === highlightedId ? 'selected' : ''}
                  />
                </button>
              ))}
            </>
          )}
        </div>
        <button className="close-btn" onClick={() => setShowEvolutionModal(false)}>
          Cerrar
        </button>
      </div>
    </div>
  )}

  {showInvolutionModal && (
    <div className="modal-overlay" onClick={() => setShowInvolutionModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Elegir Pre-evolución</h2>
        <div className="evo-list">
          {pokemonesUsuario.length === 0 ? (
            <p>No tienes Pokémon disponibles.</p>
          ) : (
            <>
              <button
                className="evo-card-btn cancel-option"
                onClick={() => {
                  setInvolutionSeleccionada(null);
                  setHighlightedId(null);
                  setShowInvolutionModal(false);
                }}
              >
                ❌ Ninguna pre-evolución
              </button>
              {pokemonesUsuario.map(p => (
                <button
                  key={p.id}
                  className="evo-card-btn"
                  onClick={() => {
                    console.log("Pre-evolución seleccionada:", p);
                    setInvolutionSeleccionada({ 
                      id: p.id, 
                      imagen: `http://localhost:5000/${p.ruta_imagen.replace(/\\/g, '/')}`
                    });
                    setHighlightedId(p.id);
                    setShowInvolutionModal(false);
                  }}
                >
                  <PokemonCardClassic 
                    pokemon={p} 
                    className={p.id === highlightedId ? 'selected' : ''}
                  />
                </button>
              ))}
            </>
          )}
        </div>
        <button className="close-btn" onClick={() => setShowInvolutionModal(false)}>
          Cerrar
        </button>
      </div>
    </div>
  )}



      <div className="form-section add-pokemon">
      
      <div className="form-header-fixed">
        <button className="corner-button left" onClick={() => window.history.back()}>
          ⬅ Volver
        </button>
        <h1>Añadir un nuevo pokemon</h1>
        <button 
          className="corner-button right" 
          type="submit"
          form="add-pokemon-form" 
        >
          <AddIcon className="add-icon" />
          <span>Añadir</span>
        </button>
      </div>

      <form id="add-pokemon-form" onSubmit={handleSubmit}>
        <div id="information">
          <label htmlFor="input-file-1" className="drop-area">
            <input ref={inputRef1} type="file" accept="image/*" id="input-file-1" hidden />

            <div className="img-view" ref={imageViewRef1}>
              <img className="img-icon" src={evolutionIcon} alt="evolución" />
              <p>Arrastra o click aquí<br />para subir la imagen</p>
              <span>Sube una imagen de tu pokemon desde el escritorio</span>
            </div>
          </label>

          <div id="description">

            <div className="form-input dd">
              <input 
                type="text"
                required
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
              />
              <label>Nombre</label>
            </div>

            <div className="form-input textarea">
              <textarea 
                name="descripcion" 
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                ></textarea>
              <label>Añadir la descripcion</label>
            </div>
          </div>
        </div>

        <div id="characteristics">
          <h3>Caracteristicas</h3>
          <div id="form-char">
            <div className="char-input">
              <div className="form-input">
                <input
                  type="number"
                  required
                  min="0"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  className="no-spinner"
                />
                <label>Altura</label>
              </div>
              <label>m</label>
            </div>

            <div className="char-input">
              <div className="form-input">
                <input
                  type="number"
                  required
                  min="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="no-spinner"
                />
                <label>Peso</label>
              </div>
              <label>kg</label>
            </div>


            <div className="form-input select">
              <select
                id="categoria" 
                name="categoria" 
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                <option value="raton">Pokémon Ratón</option>
                <option value="llama">Pokémon Llama</option>
                <option value="semilla">Pokémon Semilla</option>
                <option value="dragon">Pokémon Dragón</option>
                <option value="murcielago">Pokémon Murciélago</option>
                <option value="serpiente">Pokémon Serpiente</option>
                <option value="psiquico">Pokémon Psíquico</option>
                <option value="fantasma">Pokémon Fantasma</option>
                <option value="volador">Pokémon Volador</option>
                <option value="pez">Pokémon Pez</option>
                <option value="planta">Pokémon Planta</option>
                <option value="hongo">Pokémon Hongo</option>
                <option value="armadura">Pokémon Armadura</option>
                <option value="hielo">Pokémon Hielo</option>
                <option value="roca">Pokémon Roca</option>
                <option value="acero">Pokémon Acero</option>
              </select>
            </div>


            <div className="form-input select">
              <select
                id="habilidad" 
                name="habilidad" 
                required
                value={habilidad}
                onChange={(e) => setHabilidad(e.target.value)}
              >
                <option value="">Selecciona una habilidad</option>
                <option value="levitacion">Levitación</option>
                <option value="absorbe-fuego">Absorbe Fuego</option>
                <option value="absorb-agua">Absorbe Agua</option>
                <option value="clorofila">Clorofila</option>
                <option value="cuerpo-llama">Cuerpo Llama</option>
                <option value="punio-ferro">Puño Férreo</option>
                <option value="piel-seca">Piel Seca</option>
                <option value="mar-latente">Mar Latente</option>
                <option value="impulso">Impulso</option>
                <option value="intimidacion">Intimidación</option>
                <option value="moho">Moho</option>
                <option value="multiescamas">Multiescamas</option>
                <option value="poder-arenoso">Poder Arenoso</option>
                <option value="regeneracion">Regeneración</option>
                <option value="tormenta-arena">Tormenta Arena</option>
                <option value="velo-prisma">Velo Prisma</option>
                {/* Agrega más si lo necesitas */}
              </select>
            </div>

            <div className="form-input select">
              <select
                id="genero" 
                name="genero"
                required
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
              >
                <option value="">Género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        <div id="type">
        <h3>Tipo*</h3>
        <div className="tags">
          {tiposSeleccionados.map((tipo, idx) => (
            <span key={idx} className="tag">
              {tipo}
              <button
                type="button"
                className="remove-tag"
                onClick={() => eliminarTipo(tipo)}
              >
                &times;
              </button>
            </span>
          ))}

          {/* Mostrar el select solo si hay menos de 2 tipos */}
          {tiposSeleccionados.length < 2 && (
            <select className="add-tag" onChange={agregarTipo}>
              <option value="">+ Añadir tipo</option>
              {tiposDisponibles.map((tipo, idx) => (
                <option key={idx} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>


        <div id="evolutions">
          <h3>Evoluciones</h3>
          <div id="evolution-line">
            <button 
              type="button" 
              className="add-box involution" 
              onClick={() => setShowInvolutionModal(true)}
            >
              {involutionSeleccionada ? (
                <img src={involutionSeleccionada.imagen} alt="Involución" />
              ) : '+'}
            </button>

            <div className="box-container" ref={imageEvolutionRef}>
              <img src={evolutionIcon} alt="fondo superpuesto" />
            </div>

            <button 
              type="button" 
              className="add-box evolution" 
              onClick={() => setShowEvolutionModal(true)}
            >
              {evolutionSeleccionada ? (
                <img src={evolutionSeleccionada.imagen} alt="Evolución" />
              ) : '+'}
            </button>
          </div>

        </div>

        <div id="location">
          <div><h3>Ubicación</h3></div>
          <div id="map">
            <label htmlFor="input-file-2" className="drop-area">
              <input ref={inputRef2} type="file" accept="image/*" id="input-file-2" hidden />
              <div className="img-view" ref={imageViewRef2}>
                <img className="img-icon" src={pinIcon} alt="ubicación" />
                <p>Arrastra o click aquí<br />para subir la imagen</p>
                <span>Sube una imagen de la ubicación donde encontraste a tu pokemon desde el escritorio</span>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
    </>
    
  );
};

export default AddPokemon;

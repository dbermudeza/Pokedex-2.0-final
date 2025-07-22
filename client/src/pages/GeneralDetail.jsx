import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MobileMenu from '../components/MobileMenu';
import ViewTypeBar from '../components/ViewTypeBar';
import typeColors from '../utils/typeColors';
import TypeFilterModal from '../components/TypeFilterModal';
import SortModal from "../components/SortModal";
import { useAuth } from '../context/AuthContext';
import { getEvolutionLineForPokemon } from '../services/pokemonService';

import './GeneralDetail.css';

const GeneralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado de sesión
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  
  // Estados para pokémon y favoritos
  const [pokemon, setPokemon] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Cargar usuario actual
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (isLoggedIn && storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
    setUserLoaded(true);
  }, [isLoggedIn]);

  // Cargar pokémones desde el backend
  useEffect(() => {
    // No hacer la llamada hasta que el estado del usuario esté completamente cargado
    if (!userLoaded) return;

    const fetchPokemons = async () => {
      let url = 'http://localhost:5000/api/pokemones';
      if (currentUser) {
        url += `?userId=${currentUser.id}`;
      }
      try {
        const response = await fetch(url);
        const data = await response.json();
        setAllPokemons(data);
        
        // Encontrar el pokémon específico
        const foundPokemon = data.find(p => p.id === parseInt(id));
        setPokemon(foundPokemon);
      } catch (error) {
        console.error("Error al cargar los pokémones:", error);
        setAllPokemons([]);
        setPokemon(null);
      }
    };

    fetchPokemons();
  }, [id, currentUser, userLoaded]);

  const handleToggleFavorite = async () => {
    if (!currentUser || !pokemon) return;

    try {
      const response = await fetch('http://localhost:5000/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          pokemonId: pokemon.id
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Actualizar el estado local del pokémon
        setPokemon(prev => ({
          ...prev,
          favorito: result.isFavorite
        }));
      } else {
        console.error('Error al cambiar favorito:', result.error);
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  };

  // Handlers de login/logout
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 600) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [viewType, setViewType] = useState('general');
  
  // Filtro de tipos
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortType] = useState("id-asc");
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  const handleSortSelect = (value) => {
    setShowSortModal(false);
    const params = [];
    if (selectedTypes && selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
    if (value) params.push(`sort=${value}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    navigate(`/general${query}`);
  };
  
  const handleApplyFilter = () => {
    setShowTypeFilter(false);
    if (selectedTypes.length > 0) {
      navigate(`/general?types=${selectedTypes.join(",")}`);
    } else {
      navigate("/general");
    }
  };
  
  // Búsqueda
  const handleSearch = (value) => {
    const params = [];
    if (selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
    if (value && value.trim() !== "") params.push(`search=${encodeURIComponent(value)}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    navigate(`/general${query}`);
  };

  const handleFavoritesToggle = () => {
    navigate('/general?favorites=true');
  };

  // Obtener línea evolutiva usando la función del servicio
  const evolutionLine = pokemon ? getEvolutionLineForPokemon(pokemon.id, allPokemons) : [];

  // Navegación entre pokémon
  const handlePrev = () => {
    if (pokemon && allPokemons.length > 0) {
      // Ordenar los Pokémon por ID y encontrar el anterior
      const sortedPokemons = [...allPokemons].sort((a, b) => a.id - b.id);
      const currentIndex = sortedPokemons.findIndex(p => p.id === pokemon.id);
      
      if (currentIndex > 0) {
        const prevPokemon = sortedPokemons[currentIndex - 1];
        navigate(`/general/detalles/${prevPokemon.id}`);
      }
    }
  };

  const handleNext = () => {
    if (pokemon && allPokemons.length > 0) {
      // Ordenar los Pokémon por ID y encontrar el siguiente
      const sortedPokemons = [...allPokemons].sort((a, b) => a.id - b.id);
      const currentIndex = sortedPokemons.findIndex(p => p.id === pokemon.id);
      
      if (currentIndex < sortedPokemons.length - 1) {
        const nextPokemon = sortedPokemons[currentIndex + 1];
        navigate(`/general/detalles/${nextPokemon.id}`);
      }
    }
  };

  if (!pokemon) {
    return (
      <div className="general-detail-page">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          isLoggedIn={isLoggedIn}
          onLoginClick={handleLogin}
          onLogoutClick={handleLogout}
          onFavoritesClick={handleFavoritesToggle}
          username={currentUser?.nombre}
          pokedexCount={currentUser ? allPokemons.filter(p => p.id_usuario === currentUser.id).length : 0}
          onFilter={() => setShowTypeFilter(true)}
        />
        <div style={{ padding: 40, textAlign: 'center', color: '#cb3f41', fontWeight: 'bold' }}>
          Pokémon no encontrado.
        </div>
        {showTypeFilter && (
          <TypeFilterModal
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            onApply={handleApplyFilter}
            onClose={() => setShowTypeFilter(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="general-detail-page">
      <Header
        onMenuClick={() => setMobileMenuOpen(true)}
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onFavoritesClick={handleFavoritesToggle}
        username={currentUser?.nombre}
        pokedexCount={currentUser ? allPokemons.filter(p => p.id_usuario === currentUser.id).length : 0}
        onFilter={() => setShowTypeFilter(true)}
      />
      <SearchBar
        onFilter={() => setShowTypeFilter(true)}
        onSortClick={() => setShowSortModal(true)}
        onSearch={handleSearch}
      />
      <ViewTypeBar viewType={viewType} onChange={setViewType} />
      {mobileMenuOpen && (
        <MobileMenu
          isLoggedIn={isLoggedIn}
          userName={currentUser?.nombre}
          pokedexCount={currentUser ? allPokemons.filter(p => p.id_usuario === currentUser.id).length : 0}
          onLogin={() => { setIsLoggedIn(true);}}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onFilter={() => setShowTypeFilter(true)}
          onSort={() => setShowSortModal(true)}
          onFavoritesClick={handleFavoritesToggle}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      {showTypeFilter && (
        <TypeFilterModal
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          onApply={handleApplyFilter}
          onClose={() => setShowTypeFilter(false)}
        />
      )}
      {showSortModal && (
          <SortModal
            show={showSortModal}
            sortType={sortType}
            onSelect={handleSortSelect}
            onClose={() => setShowSortModal(false)}
          />
        )}
      <div className="general-detail-container">
        <div>
          <div className="detail-nav-bar">
            <button
              className="nav-arrow"
              onClick={handlePrev}
              disabled={!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === 0}
              aria-label="Anterior"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: (!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === 0) ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#0D84EF', fontSize: '2.5rem' }}>
                line_start_arrow_notch
              </span>
            </button>
            <button
              className="nav-back"
              onClick={() => navigate('/general')}
            >
              Volver
            </button>
            <button
              className="nav-arrow"
              onClick={handleNext}
              disabled={!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === allPokemons.length - 1}
              aria-label="Siguiente"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: (!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === allPokemons.length - 1) ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#0D84EF', fontSize: '2.5rem' }}>
                line_end_arrow_notch
              </span>
            </button>
          </div>
          <div className="general-detail-container">
            <div className="general-detail-left">
              <img className="general-pokemon-img" src={pokemon?.ruta_imagen ? `http://localhost:5000/${pokemon.ruta_imagen}` : "/assets/pokeball.png"} alt={pokemon?.nombre || "Pokemon"} />
              <div className="general-gender-icons">
                {pokemon.genero ? (
                  <span
                    className="material-icons gender-icon"
                    style={{
                      color: pokemon.genero === "M" ? "#2196f3" : "#e91e63",
                      fontSize: "2rem",
                    }}
                  >
                    {pokemon.genero === "M" ? "male" : "female"}
                  </span>
                ) : (
                  <span style={{ color: "#888", fontSize: "1rem" }}>No tiene genero</span>
                )}
              </div>
              <div className="general-types" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {pokemon?.type?.map((t, i) => (
                  <span
                    className="general-type-box"
                    key={i}
                    style={{
                      background: typeColors[t] || "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="general-detail-right">
              <div className="general-top-bar">
                <span className="general-pokemon-id">#{pokemon?.id || "000"}</span>
                <span className="general-pokemon-name">{pokemon?.nombre || "Nombre Pokemon"}</span>
                <span
                  className="favorite-icon material-icons"
                  style={{
                    marginLeft: 'auto',
                    color: pokemon?.favorito ? '#cb3f41' : '#ccc',
                    fontSize: '2rem',
                    cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                    transition: 'color 0.2s',
                    opacity: isLoggedIn ? 1 : 0.5,
                    userSelect: 'none'
                  }}
                  onClick={isLoggedIn ? handleToggleFavorite : undefined}
                  title={
                    !isLoggedIn 
                      ? "Debes iniciar sesión para marcar favoritos"
                      : pokemon?.favorito 
                        ? "Quitar de favoritos" 
                        : "Añadir a favoritos"
                  }
                >
                  {pokemon?.favorito ? 'favorite' : 'favorite_border'}
                </span>
              </div>

              <div className="general-info-box">
                <div className="general-info-header">
                  <span className="general-alt-box"><b>CATEGORÍA:</b> {pokemon?.categoria || "???"}</span>
                  <span className="general-alt-box"><b>HABILIDAD:</b> {pokemon?.habilidad || "???"}</span>
                </div>
                <div className="general-info-secondary">
                  <span className="general-alt-box"><b>ALTURA:</b> {pokemon?.altura || "???"}</span>
                  <span className="general-alt-box"><b>PESO:</b> {pokemon?.peso || "???"}</span>
                </div>
                <div className="general-description-box">
                  <p>
                    {pokemon?.descripcion || "Aquí va la descripción del Pokémon. Este texto puede ser largo y tendrá un fondo rojo con texto blanco."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="general-evolution-section no-bg">
            <h3>LÍNEA EVOLUTIVA</h3>
            <hr />
            <div className="general-evolution-line" >
              {evolutionLine.map((evoId, idx) => {
                const evo = allPokemons.find(p => p.id === evoId);
                return (
                  <div className="general-evolution-card" key={evoId || idx} style={{ minWidth: 90, textAlign: 'center' }}>
                    {evo && evo.ruta_imagen ? (
                      <>
                        <img
                          src={`http://localhost:5000/${evo.ruta_imagen}`}
                          alt={evo.nombre}
                          style={{ width: 60, height: 60, objectFit: "contain", display: "block", margin: "0 auto" }}
                        />
                        <div style={{ marginTop: 4 }}>{evo.nombre}</div>
                      </>
                    ) : (
                      <img src="/assets/pokeball.png" alt="Unknown" style={{ width: 60, height: 60, opacity: 0.3 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="general-habitat-section no-bg">
            <h3>HABITAT</h3>
            <div className="general-habitat-map">
              <img 
                src={
                  pokemon?.ruta_ubicacion && pokemon.ruta_ubicacion.startsWith('uploads/') 
                    ? `http://localhost:5000/${pokemon.ruta_ubicacion}` 
                    : "/assets/pokemonmap.png"
                } 
                alt="Hábitat"
                onError={(e) => {
                  e.target.src = "/assets/pokemonmap.png";
                }}
              />
            </div>
          </div>

          <div className="detail-nav-bar">
            <button
              className="nav-arrow"
              onClick={handlePrev}
              disabled={!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === 0}
              aria-label="Anterior"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: (!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === 0) ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#0D84EF', fontSize: '2.5rem' }}>
                line_start_arrow_notch
              </span>
            </button>
            <button
              className="nav-back"
              onClick={() => navigate('/general')}
            >
              Volver
            </button>
            <button
              className="nav-arrow"
              onClick={handleNext}
              disabled={!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === allPokemons.length - 1}
              aria-label="Siguiente"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: (!pokemon || !allPokemons.length || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === allPokemons.length - 1) ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#0D84EF', fontSize: '2.5rem' }}>
                line_end_arrow_notch
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GeneralDetail;
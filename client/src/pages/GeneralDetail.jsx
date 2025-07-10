import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pokemonsData from '../data/pokemons';
import user from '../data/users';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MobileMenu from '../components/MobileMenu';
import ViewTypeBar from '../components/ViewTypeBar';
import typeColors from '../utils/typeColors';
import TypeFilterModal from '../components/TypeFilterModal';
import SortModal from "../components/SortModal";
import { useAuth } from '../context/AuthContext';


import './GeneralDetail.css';

const FAVORITES_KEY = 'pokedex_favorites';

function getInitialFavorites() {
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  // Si no hay nada en localStorage, usar los favoritos del archivo original
  const initial = {};
  pokemonsData.forEach(p => {
    if (p.favorito) initial[p.id] = true;
  });
  return initial;
}

const GeneralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado de sesión
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  // Estado global de favoritos (por id)
  const [favorites, setFavorites] = useState(getInitialFavorites);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

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
  // Creamos una copia de los pokemons con el estado de favorito actualizado desde localStorage
  const pokemons = pokemonsData.map(p => ({
    ...p,
    favorito: !!favorites[p.id]
  }));
  const pokemon = pokemons.find(p => p.id === parseInt(id));

  const handleToggleFavorite = () => {
    setFavorites(prev => ({
      ...prev,
      [pokemon.id]: !prev[pokemon.id]
    }));
  };

  // Filtro de tipos
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortType] = useState("id-asc");
  const handleSortSelect = (value) => {
  setShowSortModal(false);
  const params = [];
  if (selectedTypes && selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
  if (value) params.push(`sort=${value}`);
  const query = params.length > 0 ? `?${params.join("&")}` : "";
  navigate(`/general${query}`);
};
  const [selectedTypes, setSelectedTypes] = useState([]);
  const handleApplyFilter = () => {
    setShowTypeFilter(false);
    if (selectedTypes.length > 0) {
      navigate(`/general?types=${selectedTypes.join(",")}`);
    } else {
      navigate("/general");
    }
  };
  //busqueda
 const handleSearch = (value) => {
  const params = [];
  if (selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
  if (value && value.trim() !== "") params.push(`search=${encodeURIComponent(value)}`);
  const query = params.length > 0 ? `?${params.join("&")}` : "";
  navigate(`/general${query}`);
};
  // Lógica de línea evolutiva
  const getEvolutionLine = (id) => {  
    if ([1, 2, 3].includes(id)) return [1, 2, 3];
    if ([4, 5, 6].includes(id)) return [4, 5, 6];
    if ([7, 8, 9].includes(id)) return [7, 8, 9];
    if ([10, 11, 12].includes(id)) return [10, 11, 12];
    if ([13, 14].includes(id)) return [13, 14];
    return [id];
  };
  const evolutionLine = pokemon ? getEvolutionLine(pokemon.id) : [];

  // Navegación entre pokémon
  const handlePrev = () => {
    if (pokemon.id > 1) {
      navigate(`/general/detalles/${pokemon.id - 1}`);
    }
  };

  const handleNext = () => {
    if (pokemon.id < pokemons.length) {
      navigate(`/general/detalles/${pokemon.id + 1}`);
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
          username={user.username}
          pokedexCount={user.pokemons.length}
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
        username={user.username}
        pokedexCount={user.pokemons.length}
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
          userName={user.username}
          pokedexCount={user.pokemons.length}
          onLogin={() => { setIsLoggedIn(true);}}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onFilter={() => setShowTypeFilter(true)}
          onSort={() => setShowSortModal(true)}
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
              disabled={pokemon.id === 1}
              aria-label="Anterior"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: pokemon.id === 1 ? 'not-allowed' : 'pointer' }}
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
              disabled={pokemon.id === pokemons.length}
              aria-label="Siguiente"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: pokemon.id === pokemons.length ? 'not-allowed' : 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#0D84EF', fontSize: '2.5rem' }}>
                line_end_arrow_notch
              </span>
            </button>
          </div>
          <div className="general-detail-container">
            <div className="general-detail-left">
              <img className="general-pokemon-img" src={pokemon?.sprite || "/assets/pokeball.png"} alt={pokemon?.name || "Pokemon"} />
              <div className="general-gender-icons">
                {pokemon.gender && pokemon.gender.length > 0 ? (
                  pokemon.gender.map((g, idx) => (
                    <span
                      key={g}
                      className="material-icons gender-icon"
                      style={{
                        color: g === "male" ? "#2196f3" : "#e91e63",
                        fontSize: "2rem",
                      }}
                    >
                      {g === "male" ? "male" : "female"}
                    </span>
                  ))
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
                <span className="general-pokemon-id">#{pokemon?.dexNumber || "000"}</span>
                <span className="general-pokemon-name">{pokemon?.name || "Nombre Pokemon"}</span>
                <span
                  className="favorite-icon material-icons"
                  style={{
                    marginLeft: 'auto',
                    color: pokemon.favorito ? '#cb3f41' : '#cb3f41',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onClick={handleToggleFavorite}
                  title={pokemon.favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                  {pokemon.favorito ? 'favorite' : 'favorite_border'}
                </span>
              </div>

              <div className="general-info-box">
                <div className="general-info-header">
                  <span className="general-alt-box"><b>CATEGORÍA:</b> {pokemon?.category || "???"}</span>
                  <span className="general-alt-box"><b>HABILIDAD:</b> {pokemon?.habilities?.[0] || "???"}</span>
                </div>
                <div className="general-info-secondary">
                  <span className="general-alt-box"><b>ALTURA:</b> {pokemon?.height || "???"}</span>
                  <span className="general-alt-box"><b>PESO:</b> {pokemon?.weight || "???"}</span>
                </div>
                <div className="general-description-box">
                  <p>
                    {pokemon?.description || "Aquí va la descripción del Pokémon. Este texto puede ser largo y tendrá un fondo rojo con texto blanco."}
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
                const evo = pokemons.find(p => p.id === evoId);
                return (
                  <div className="general-evolution-card" key={evoId || idx} style={{ minWidth: 90, textAlign: 'center' }}>
                    {evo && evo.sprite ? (
                      <>
                        <img
                          src={evo.sprite}
                          alt={evo.name}
                          style={{ width: 60, height: 60, objectFit: "contain", display: "block", margin: "0 auto" }}
                        />
                        <div style={{ marginTop: 4 }}>{evo.name}</div>
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
              <img src="/assets/pokemonmap.png" alt="Hábitat" />
            </div>
          </div>

          <div className="detail-nav-bar">
            <button
              className="nav-arrow"
              onClick={handlePrev}
              disabled={pokemon.id === 1}
              aria-label="Anterior"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: pokemon.id === 1 ? 'not-allowed' : 'pointer' }}
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
              disabled={pokemon.id === pokemons.length}
              aria-label="Siguiente"
              style={{ background: 'none', border: 'none', boxShadow: 'none', cursor: pokemon.id === pokemons.length ? 'not-allowed' : 'pointer' }}
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
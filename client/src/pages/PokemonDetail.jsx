import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import pokemons from '../data/pokemons';
import user from '../data/users';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MobileMenu from '../components/MobileMenu';
import ViewTypeBar from '../components/ViewTypeBar';
import TypeFilterModal from '../components/TypeFilterModal';
import SortModal from '../components/SortModal';
import './PokemonDetail.css';
import { useAuth } from '../context/AuthContext';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pokemon = pokemons.find(p => p.id === parseInt(id));

  const query = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(parseInt(query.get('page')) || 1);

  // Barras y mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewType, setViewType] = useState('clasica');

  // Filtros y búsqueda desde query params
  const params = new URLSearchParams(location.search);
  const typesFromQuery = params.get("types") ? params.get("types").split(",") : [];
  const sortType = params.get("sort") || "id-asc";
  const searchValue = params.get("search") || "";
  const [selectedTypes, setSelectedTypes] = useState(typesFromQuery);

  const handleApplyFilter = () => {
    setShowTypeFilter(false);
    const params = [];
    if (selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
    if (sortType) params.push(`sort=${sortType}`);
    if (searchValue && searchValue.trim() !== "") params.push(`search=${encodeURIComponent(searchValue)}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    navigate(`/clasica${query}`);
  };

  const handleSortSelect = (value) => {
    setShowSortModal(false);
    const params = [];
    if (selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
    if (value) params.push(`sort=${value}`);
    if (searchValue && searchValue.trim() !== "") params.push(`search=${encodeURIComponent(searchValue)}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    navigate(`/clasica${query}`);
  };

  const handleSearch = (value) => {
    const params = [];
    if (selectedTypes.length > 0) params.push(`types=${selectedTypes.join(",")}`);
    if (sortType) params.push(`sort=${sortType}`);
    if (value && value.trim() !== "") params.push(`search=${encodeURIComponent(value)}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    navigate(`/clasica${query}`);
  };

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const handleBack = () => {
    navigate('/clasica');
  };
  const handlePrev = () => {
    if (pokemon.id > 1) {
      navigate(`/clasica/detalles/${pokemon.id - 1}?page=${page}`);
    }
  };
  const handleNext = () => {
    if (pokemon.id < pokemons.length) {
      navigate(`/clasica/detalles/${pokemon.id + 1}?page=${page}`);
    }
  };

  if (!pokemon) {
    return <div className="detail-container">Pokémon no encontrado.</div>;
  }

  return (
    <div className="detail-container">
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
          onLogin={handleLogin}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onFilter={() => setShowTypeFilter(true)}
          onSort={() => setShowSortModal(true)}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      
      <div className="detail-content">
        <button className="detail-back" onClick={handleBack}>
        ← Volver
      </button>
        <div className="detail-rotom-container">
          <img src="/assets/rotomdexclassic.png" alt="RotomDex" />
          <div className="detail-overlay">
            <div className="detail-sprite-side">
              <div className="detail-number">N.º {pokemon.dexNumber}</div>
              <div className="detail-name">{pokemon.name || '???'}</div>
              <img
                src={pokemon.sprite || '/assets/pokeball.png'}
                alt={pokemon.name || '???'}
              />
            </div>
            <div className="detail-overlay-info">
                {page === 1 && (
                    <>
                        <div className="detail-category">Pokémon {pokemon.category || '???'}</div>
                        <div className="detail-types">
                            {pokemon.type?.length ? (
                                 pokemon.type.map((t, i) => <span key={i}>{t}</span>)
                            ) : (
                              <span>???</span>
                            )}
                        </div>
                        <div className="detail-description">
                            <p>{pokemon.description || 'Sin descripción.'}</p>
                        </div>
                    </>
                )}
                {page === 2 && (
                    <div className="detail-extra">
                        <p><strong>Altura:</strong> {pokemon.height || '???'}</p>
                        <p><strong>Peso:</strong> {pokemon.weight || '???'}</p>
                        <p><strong>Habilidades:</strong> {pokemon.habilities?.join(', ') || '???'}</p>
                    </div>
                )}
                {page === 3 && (
                    <div className="detail-habitat">
                        <img
                            src="/assets/pokemonmap.png"
                            alt="Mapa de hábitat"
                            className={!pokemon.discovered ? 'map-faded' : ''}
                        />
                        <div className="habitat-label">Hábitat</div>
                    </div>
                )}
            </div>
          </div>
          <div className="detail-page-buttons">
              <button onClick={() => setPage(1)} disabled={page === 1}>1</button>
              <button onClick={() => setPage(2)} disabled={page === 2}>2</button>
              <button onClick={() => setPage(3)} disabled={page === 3}>3</button>
          </div>
          <div className="detail-nav-buttons">
              <button onClick={handlePrev} disabled={pokemon.id === 1}>← Anterior</button>
              <button onClick={handleNext} disabled={pokemon.id === pokemons.length}>Siguiente →</button>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default PokemonDetail;
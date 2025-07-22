import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { pokemonService, mapPokemonData, getHabitatImageUrl } from '../services/pokemonService';
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
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  // Estados de datos
  const [pokemon, setPokemon] = useState(null);
  const [pokemonRaw, setPokemonRaw] = useState(null); // Datos originales sin mapear
  const [allPokemons, setAllPokemons] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(parseInt(query.get('page')) || 1);

  // Barras y mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewType, setViewType] = useState('clasica');

  // Filtros y búsqueda desde query params
  const params = new URLSearchParams(location.search);
  const typesFromQuery = params.get("types") ? params.get("types").split(",") : [];
  const sortType = params.get("sort") || "id-asc";
  const searchValue = params.get("search") || "";
  const [selectedTypes, setSelectedTypes] = useState(typesFromQuery);

  // Cargar datos al montar el componente o cambiar el ID
  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener usuario actual
        const storedUser = localStorage.getItem('user');
        if (isLoggedIn && storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          setCurrentUser(null);
        }

        // Obtener datos del pokémon específico y todos los pokémon
        const userId = isLoggedIn && storedUser ? JSON.parse(storedUser).id : null;
        
        console.log(`Cargando Pokémon ID: ${id}, Usuario: ${userId}`);
        
        // Forzar recarga de datos para evitar problemas de caché
        const timestamp = Date.now();
        const [pokemonData, allPokemonsData] = await Promise.all([
          pokemonService.getPokemonById(id, userId),
          pokemonService.getAllPokemons(userId)
        ]);

        console.log('Datos obtenidos:', {
          pokemonData,
          totalPokemons: allPokemonsData.length,
          pokemonIds: allPokemonsData.map(p => p.id).sort((a, b) => a - b)
        });

        if (pokemonData) {
          setPokemonRaw(pokemonData); // Guardar datos originales
          setPokemon(mapPokemonData(pokemonData));
          setAllPokemons(allPokemonsData.map(mapPokemonData));
        } else {
          console.error(`Pokémon con ID ${id} no encontrado en ${allPokemonsData.length} pokémons disponibles`);
          setError('Pokémon no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar datos del pokémon:', err);
        setError('Error al cargar los datos del pokémon');
      } finally {
        setLoading(false);
      }
    };

    loadPokemonData();
  }, [id, isLoggedIn]); // Dependencias importantes: id e isLoggedIn

  // Actualizar selectedTypes cuando cambie la URL
  useEffect(() => {
    setSelectedTypes(typesFromQuery);
  }, [location.search]);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/clasica');
  };

  const handleFavoritesClick = () => {
    navigate('/clasica?favorites=true');
  };

  const handleBack = () => {
    // Preservar parámetros de búsqueda y filtros si existen
    const params = new URLSearchParams(location.search);
    const searchParams = new URLSearchParams();
    
    // Mantener parámetros relevantes de la vista anterior
    if (params.get('types')) searchParams.set('types', params.get('types'));
    if (params.get('sort')) searchParams.set('sort', params.get('sort'));
    if (params.get('search')) searchParams.set('search', params.get('search'));
    if (params.get('favorites')) searchParams.set('favorites', params.get('favorites'));
    
    const queryString = searchParams.toString();
    const destination = queryString ? `/clasica?${queryString}` : '/clasica';
    
    navigate(destination);
  };
  
  const handlePrev = () => {
    if (pokemon && allPokemons.length > 0) {
      // Ordenar los Pokémon por ID y encontrar el anterior
      const sortedPokemons = [...allPokemons].sort((a, b) => a.id - b.id);
      const currentIndex = sortedPokemons.findIndex(p => p.id === pokemon.id);
      
      if (currentIndex > 0) {
        const prevPokemon = sortedPokemons[currentIndex - 1];
        navigate(`/clasica/detalles/${prevPokemon.id}?page=${page}`);
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
        navigate(`/clasica/detalles/${nextPokemon.id}?page=${page}`);
      }
    }
  };

  // Manejar estados de carga y error
  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading">Cargando pokémon...</div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="detail-container">
        <div className="error">
          {error || 'Pokémon no encontrado.'}
          <button onClick={() => navigate('/clasica')}>Volver al listado</button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Header
        onMenuClick={() => setMobileMenuOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogoutClick={handleLogout}
        username={currentUser?.nombre}
        pokedexCount={currentUser ? allPokemons.filter(p => p.userId === currentUser.id).length : 0}
        onFilter={() => setShowTypeFilter(true)}
        onFavoritesClick={handleFavoritesClick}
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
          pokedexCount={currentUser ? allPokemons.filter(p => p.userId === currentUser.id).length : 0}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onFilter={() => setShowTypeFilter(true)}
          onSort={() => setShowSortModal(true)}
          onFavoritesClick={handleFavoritesClick}
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
                            src={getHabitatImageUrl(pokemonRaw?.ruta_ubicacion)}
                            alt="Mapa de hábitat"
                            className={!pokemon.discovered ? 'map-faded' : ''}
                            onError={(e) => {
                              e.target.src = "/assets/pokemonmap.png";
                            }}
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
              <button 
                onClick={handlePrev} 
                disabled={!pokemon || allPokemons.length === 0 || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === 0}
              >
                ← Anterior
              </button>
              <button 
                onClick={handleNext} 
                disabled={!pokemon || allPokemons.length === 0 || [...allPokemons].sort((a, b) => a.id - b.id).findIndex(p => p.id === pokemon.id) === allPokemons.length - 1}
              >
                Siguiente →
              </button>
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
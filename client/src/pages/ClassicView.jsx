import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PokemonCardClassic from '../components/PokemonCardClassic';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';
import MobileMenu from '../components/MobileMenu';
import ViewTypeBar from '../components/ViewTypeBar';
import TypeFilterModal from '../components/TypeFilterModal';
import SortModal from '../components/SortModal';
import { pokemonService, mapPokemonData, getImageUrl, getEvolutionLineForPokemon } from '../services/pokemonService';
import './ClassicView.css';
import { useAuth } from '../context/AuthContext';

const ClassicView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  // Estados de datos
  const [allPokemons, setAllPokemons] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de UI
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewType, setViewType] = useState('clasica');

  // Carga de datos
  useEffect(() => {
    const fetchPokemons = async () => {
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

        // Obtener pokémons desde la API
        const userId = isLoggedIn && storedUser ? JSON.parse(storedUser).id : null;
        console.log('Cargando pokémons en ClassicView para usuario:', userId);
        
        const pokemonsData = await pokemonService.getAllPokemons(userId);
        
        console.log('Pokémons obtenidos:', pokemonsData.length, 'IDs:', pokemonsData.map(p => p.id).sort((a, b) => a - b));
        
        // Mapear los datos al formato esperado por el frontend
        const mappedPokemons = pokemonsData.map(mapPokemonData);
        setAllPokemons(mappedPokemons);
      } catch (err) {
        console.error('Error al obtener pokémones del backend:', err);
        setError('Error al cargar los pokémones');
        setAllPokemons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [isLoggedIn]);

  // Recargar datos cuando el usuario vuelve a la página (foco)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Página recobró el foco, recargando datos...');
      const fetchPokemons = async () => {
        try {
          const storedUser = localStorage.getItem('user');
          const userId = isLoggedIn && storedUser ? JSON.parse(storedUser).id : null;
          const pokemonsData = await pokemonService.getAllPokemons(userId);
          const mappedPokemons = pokemonsData.map(mapPokemonData);
          setAllPokemons(mappedPokemons);
          console.log('Datos actualizados al volver a la página');
        } catch (err) {
          console.error('Error al recargar pokémones:', err);
        }
      };

      fetchPokemons();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoggedIn]);

  // Lógica de filtros, búsqueda y ordenamiento
  const params = new URLSearchParams(location.search);
  const typesFromQuery = params.get("types") ? params.get("types").split(",") : [];
  const sortType = params.get("sort") || "id-asc";
  const searchValue = params.get("search") || "";
  const showFavoritesOnly = params.get("favorites") === "true";
  const [selectedTypes, setSelectedTypes] = useState(typesFromQuery);
  
  useEffect(() => {
    setSelectedTypes(typesFromQuery);
  }, [location.search]);

  const filteredPokemons = allPokemons.filter(p => {
    const matchesType = typesFromQuery.length === 0 || (p.type && p.type.some(type => typesFromQuery.includes(type)));
    const matchesSearch = !searchValue || (p.name && p.name.toLowerCase().includes(searchValue.toLowerCase()));
    const matchesFavorites = !showFavoritesOnly || p.favorito === true;
    return matchesType && matchesSearch && matchesFavorites;
  });

  const sortedPokemons = [...filteredPokemons].sort((a, b) => {
    switch (sortType) {
      case "id-asc": return a.id - b.id;
      case "id-desc": return b.id - a.id;
      case "name-asc": return (a.name || "").localeCompare(b.name || "");
      case "name-desc": return (b.name || "").localeCompare(a.name || "");
      default: return 0;
    }
  });

  // Funciones de manejo de eventos
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/clasica');
  };

  const buildQueryString = (newParams) => {
    const currentParams = {
        types: selectedTypes.join(','),
        sort: sortType,
        search: searchValue,
        favorites: showFavoritesOnly ? 'true' : '',
        ...newParams
    };
    const params = new URLSearchParams();
    if (currentParams.types) params.append('types', currentParams.types);
    if (currentParams.sort) params.append('sort', currentParams.sort);
    if (currentParams.search) params.append('search', currentParams.search);
    if (currentParams.favorites) params.append('favorites', currentParams.favorites);
    return params.toString() ? `?${params.toString()}` : '';
  }

  const handleApplyFilter = () => {
    setShowTypeFilter(false);
    navigate(`/clasica${buildQueryString({ types: selectedTypes.join(',') })}`);
  };

  const handleSortSelect = (value) => {
    setShowSortModal(false);
    navigate(`/clasica${buildQueryString({ sort: value })}`);
  };

  const handleSearch = (value) => {
    navigate(`/clasica${buildQueryString({ search: value })}`);
  };

  const handleFavoritesClick = () => {
    navigate(`/clasica${buildQueryString({ favorites: !showFavoritesOnly ? 'true' : undefined })}`);
  };

  // Función para refrescar manualmente los datos
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      const userId = isLoggedIn && storedUser ? JSON.parse(storedUser).id : null;
      
      console.log('Refrescando datos manualmente...');
      
      const pokemonsData = await pokemonService.getAllPokemons(userId, true);
      const mappedPokemons = pokemonsData.map(mapPokemonData);
      setAllPokemons(mappedPokemons);
      
      console.log('Datos refrescados exitosamente');
    } catch (err) {
      console.error('Error al refrescar pokémones:', err);
      setError('Error al refrescar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Lógica específica de la vista - Líneas evolutivas usando datos de BD
  const getEvolutionLine = (id) => {
    return getEvolutionLineForPokemon(id, allPokemons);
  };

  const evolutionLine = selectedId ? getEvolutionLine(selectedId) : [];

  // Estados de carga y error
  if (loading) {
    return (
      <div className="classic-container">
        <div className="loading">Cargando pokémones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="classic-container">
        <div className="error">
          {error}
          <button onClick={() => window.location.reload()}>Recargar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="classic-container">
      <Header
        onMenuClick={() => setMobileMenuOpen(true)}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        onFavoritesClick={handleFavoritesClick}
        username={currentUser?.nombre}
        pokedexCount={currentUser ? allPokemons.filter(p => p.userId === currentUser.id).length : 0}
        onFilter={() => setShowTypeFilter(true)}
      />
      <SearchBar
        onFilter={() => setShowTypeFilter(true)}
        onSortClick={() => setShowSortModal(true)}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />
      <ViewTypeBar viewType={viewType} onChange={(type) => navigate(`/${type}`)} />
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

      <div className="evolution-bar">
        {evolutionLine.length > 0 ? (
          evolutionLine.map((evoId) => {
            const evo = allPokemons.find(p => p.id === evoId);
            const imageUrl = evo ? evo.sprite : "/assets/pokeball.png";
            return (
              <div key={evoId} className={`evolution-slot ${evo && evo.id === selectedId ? 'selected' : ''}`}>
                <img src={imageUrl} alt={evo ? evo.name : "Unknown"} />
              </div>
            );
          })
        ) : (
          [1, 2, 3].map((_, index) => (
            <div key={index} className="evolution-slot">
              <img src="/assets/pokeball.png" alt="Placeholder" />
            </div>
          ))
        )}
      </div>

      <div className="pokedex-layout">
        <div className="rotomdex-area">
          <div className="rotomdex-image">
            <img src="/assets/rotomdex.png" alt="RotomDex" />
          </div>
          <div className="rotomdex-text">¡Escoge uno para ver más información!</div>
        </div>

        <div className="pokemon-list">
          {sortedPokemons.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              onDoubleClick={() => navigate(`/clasica/detalles/${p.id}`)}
            >
              <PokemonCardClassic pokemon={p} />
            </div>
          ))}
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

export default ClassicView;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PokemonCardClassic from '../components/PokemonCardClassic';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';
import MobileMenu from '../components/MobileMenu';
import ViewTypeBar from '../components/ViewTypeBar';
import TypeFilterModal from '../components/TypeFilterModal';
import SortModal from '../components/SortModal';
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

  // Estados de UI
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewType, setViewType] = useState('clasica');

  // Carga de datos
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (isLoggedIn && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setCurrentUser(null);
    }

    const fetchPokemons = async () => {
      let url = 'http://localhost:5000/api/pokemones';
      if (isLoggedIn && storedUser) {
        const user = JSON.parse(storedUser);
        url += `?userId=${user.id}`;
      }
      try {
        const response = await fetch(url);
        const data = await response.json();
        setAllPokemons(data);
      } catch (err) {
        console.error('Error al obtener pokemones del backend', err);
        setAllPokemons([]);
      }
    };

    fetchPokemons();
  }, [isLoggedIn]);

  // Lógica de filtros, búsqueda y ordenamiento
  const params = new URLSearchParams(location.search);
  const typesFromQuery = params.get("types") ? params.get("types").split(",") : [];
  const sortType = params.get("sort") || "id-asc";
  const searchValue = params.get("search") || "";
  const [selectedTypes, setSelectedTypes] = useState(typesFromQuery);
  
  useEffect(() => {
    setSelectedTypes(typesFromQuery);
  }, [location.search]);

  const filteredPokemons = allPokemons.filter(p => {
    const matchesType = typesFromQuery.length === 0 || (p.type && p.type.some(type => typesFromQuery.includes(type)));
    const matchesSearch = !searchValue || (p.nombre && p.nombre.toLowerCase().includes(searchValue.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const sortedPokemons = [...filteredPokemons].sort((a, b) => {
    switch (sortType) {
      case "id-asc": return a.id - b.id;
      case "id-desc": return b.id - a.id;
      case "name-asc": return (a.nombre || "").localeCompare(b.nombre || "");
      case "name-desc": return (b.nombre || "").localeCompare(a.nombre || "");
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
        ...newParams
    };
    const params = new URLSearchParams();
    if (currentParams.types) params.append('types', currentParams.types);
    if (currentParams.sort) params.append('sort', currentParams.sort);
    if (currentParams.search) params.append('search', currentParams.search);
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

  // Lógica específica de la vista
  const getEvolutionLine = (id) => {
    const pokemon = allPokemons.find(p => p.id === id);
    if (!pokemon) return [];
    
    // Esta es una lógica de ejemplo, deberías adaptarla a cómo manejas las evoluciones
    if ([1, 2, 3].includes(id)) return [1, 2, 3];
    if ([4, 5, 6].includes(id)) return [4, 5, 6];
    if ([7, 8, 9].includes(id)) return [7, 8, 9];
    return [id];
  };

  const evolutionLine = selectedId ? getEvolutionLine(selectedId) : [];

  return (
    <div className="classic-container">
      <Header
        onMenuClick={() => setMobileMenuOpen(true)}
        onLogoutClick={handleLogout}
        pokedexCount={currentUser ? allPokemons.filter(p => p.id_usuario === currentUser.id).length : 0}
      />
      <SearchBar
        onFilter={() => setShowTypeFilter(true)}
        onSortClick={() => setShowSortModal(true)}
        onSearch={handleSearch}
      />
      <ViewTypeBar viewType={viewType} onChange={(type) => navigate(`/${type}`)} />
      {mobileMenuOpen && (
        <MobileMenu
          pokedexCount={currentUser ? allPokemons.filter(p => p.id_usuario === currentUser.id).length : 0}
          onLogout={handleLogout}
          onSearch={handleSearch}
          onFilter={() => setShowTypeFilter(true)}
          onSort={() => setShowSortModal(true)}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="evolution-bar">
        {evolutionLine.length > 0 ? (
          evolutionLine.map((evoId) => {
            const evo = allPokemons.find(p => p.id === evoId);
            const imageUrl = evo ? `http://localhost:5000/${evo.ruta_imagen}` : "/assets/pokeball.png";
            return (
              <div key={evoId} className={`evolution-slot ${evo && evo.id === selectedId ? 'selected' : ''}`}>
                <img src={imageUrl} alt={evo ? evo.nombre : "Unknown"} />
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

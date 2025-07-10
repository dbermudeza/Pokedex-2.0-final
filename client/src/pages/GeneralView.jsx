import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PokemonCardGeneral from "../components/PokemonCardGeneral";
import TypeFilterModal from "../components/TypeFilterModal";
import SortModal from "../components/SortModal";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";
import MobileMenu from "../components/MobileMenu";
import ViewTypeBar from "../components/ViewTypeBar";
import "./GeneralView.css";
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

const GeneralView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  // Estados de datos
  const [allPokemons, setAllPokemons] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(0);

  // Estados de UI
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewType, setViewType] = useState('general');

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
        console.log("1. Datos recibidos del backend:", data); // <-- PUNTO DE CONTROL 1
        setAllPokemons(data);
      } catch (error) {
        console.error("Error al cargar los pokémones:", error);
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

  console.log("2. Estado `allPokemons`:", allPokemons); // <-- PUNTO DE CONTROL 2

  const filteredPokemons = allPokemons.filter(p => {
    const matchesType = typesFromQuery.length === 0 || (p.type && p.type.some(type => typesFromQuery.includes(type)));
    const matchesSearch = !searchValue || (p.nombre && p.nombre.toLowerCase().includes(searchValue.toLowerCase()));
    return matchesType && matchesSearch;
  });

  console.log("3. Pokémones después de filtrar:", filteredPokemons); // <-- PUNTO DE CONTROL 3

  const sortedPokemons = [...filteredPokemons].sort((a, b) => {
    switch (sortType) {
      case "id-asc": return a.id - b.id;
      case "id-desc": return b.id - a.id;
      case "name-asc": return (a.nombre || "").localeCompare(b.nombre || "");
      case "name-desc": return (b.nombre || "").localeCompare(a.nombre || "");
      default: return 0;
    }
  });
  
  console.log("4. Pokémones después de ordenar:", sortedPokemons); // <-- PUNTO DE CONTROL 4

  // Paginación
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pagePokemons = sortedPokemons.slice(start, end);
  const hasNext = end < sortedPokemons.length;
  const hasPrev = page > 0;

  console.log("5. Pokémones a mostrar en la página actual:", pagePokemons); // <-- PUNTO DE CONTROL 5

  useEffect(() => {
    setPage(0);
  }, [typesFromQuery.join(','), sortType]);

  // Funciones de manejo de eventos
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/general');
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
    navigate(`/general${buildQueryString({ types: selectedTypes.join(',') })}`);
  };

  const handleSortSelect = (value) => {
    setShowSortModal(false);
    navigate(`/general${buildQueryString({ sort: value })}`);
  };

  const handleSearch = (value) => {
    navigate(`/general${buildQueryString({ search: value })}`);
  };

  return (
    <div className="regular-view-container">
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
      <div className="regular-view-cards-area">
        <div className="regular-view-cards-grid">
          {pagePokemons.map((p) => (
            <div
              key={p.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/general/detalles/${p.id}`)}
            >
              <PokemonCardGeneral pokemon={p} />
            </div>
          ))}
        </div>
        {(hasPrev || hasNext) && (
          <div className="arrows-container">
            {hasPrev && (
              <button
                className="arrow-btn prev-arrow"
                onClick={() => setPage(page - 1)}
              ></button>
            )}
            {hasNext && (
              <button
                className="arrow-btn next-arrow"
                onClick={() => setPage(page + 1)}
              ></button>
            )}
          </div>
        )}
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

export default GeneralView;

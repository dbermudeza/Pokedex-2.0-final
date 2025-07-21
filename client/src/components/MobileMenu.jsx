import React, { useState } from 'react';
import './MobileMenu.css';
import profileIcon from '../assets/PROFILEICON.png';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import filterRombo from '../assets/filter-rombo.png';
import sortRombo from '../assets/sort-rombo.png';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileMenu = ({
  // Se quitan isLoggedIn y userName de las props
  pokedexCount = 0,
  onLogout = () => {},
  onSearch = () => {},
  onFilter = () => {},
  onSort = () => {},
  onClose = () => {},
  onFavoritesClick = () => {} // Nueva prop
}) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate(); // Hook para navegar
  const location = useLocation(); // Hook para obtener la ubicación actual
  const { isLoggedIn, username } = useAuth();

  const handleInput = (e) => setInput(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) onSearch(input);
  };

  const handleSearchClick = () => {
    if (onSearch) onSearch(input);
  };

  const handleLogin = () => {
    onClose(); // Cierra el menú
    navigate('/login'); // Navega a la página de login
  };

  const handleFavoritesClick = () => {
    onClose(); // Cierra el menú
    if (onFavoritesClick && typeof onFavoritesClick === 'function') {
      onFavoritesClick();
    } else {
      // Comportamiento por defecto
      const currentPath = location.pathname;
      if (currentPath.startsWith('/general')) {
        navigate('/general?favorites=true');
      } else if (currentPath.startsWith('/clasica')) {
        navigate('/clasica?favorites=true');
      }
    }
  };

  return (
    <div className="mobile-menu">
      <button className="close-menu" onClick={onClose}>
        <CloseIcon style={{ fontSize: 28 }} />
      </button>
      <div className="mobile-menu-header">
        {isLoggedIn ? (
          <>
            <img src={profileIcon} alt="Perfil" className="avatar" />
            <div className="user-info">
              {/* Usa el username del contexto */}
              <span className="user-name">{username}</span>
              <span className="pokedex-info">
                Pokédex <span className="pokemon-count">{pokedexCount}</span>
              </span>
            </div>
            <button className="icon-button logout" title="Cerrar sesión" onClick={onLogout}>
              <LogoutIcon style={{ color: 'black', fontSize: 24 }} />
            </button>
          </>
        ) : (
          <span
            className="login-link"
            onClick={handleLogin} // Llama a la nueva función de login
            style={{
              color: 'black',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              marginLeft: 12
            }}
          >
            Iniciar sesión
          </span>
        )}
      </div>
      <div className="mobile-menu-search" style={{ position: 'relative' }}>
        <button
          type="button"
          className="icon-button"
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#0D84EF',
            fontSize: 22,
            zIndex: 2,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleSearchClick}
          tabIndex={0}
        >
          <span className="material-icons">search</span>
        </button>
        <input
          type="text"
          placeholder="Buscar Pokémon..."
          className="search-input"
          style={{ paddingLeft: 38 }}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="mobile-menu-filters">
        {isLoggedIn && (
          <button className="icon-button" onClick={handleFavoritesClick} title="Favoritos">
            <FavoriteIcon style={{ color: '#cb3f41', fontSize: 24 }} />
          </button>
        )}
        <button className="icon-button" onClick={onFilter}>
          <img src={filterRombo} alt="Filtro" />
        </button>
        <button className="icon-button" onClick={onSort}>
          <img src={sortRombo} alt="Ordenar" />
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;

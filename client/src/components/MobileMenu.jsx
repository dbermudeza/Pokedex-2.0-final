import React, { useState } from 'react';
import './MobileMenu.css';
import profileIcon from '../assets/PROFILEICON.png';
import LogoutIcon from '@mui/icons-material/Logout';
import filterRombo from '../assets/filter-rombo.png';
import sortRombo from '../assets/sort-rombo.png';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORTA useAuth
import { useNavigate } from 'react-router-dom'; // <-- 2. IMPORTA useNavigate

const MobileMenu = ({
  // Se quitan isLoggedIn y userName de las props
  pokedexCount = 0,
  onLogout = () => {},
  onSearch = () => {},
  onFilter = () => {},
  onSort = () => {},
  onClose = () => {},
}) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate(); // Hook para navegar
  const { isLoggedIn, username } = useAuth(); // <-- 3. USA EL CONTEXTO

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
  }

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

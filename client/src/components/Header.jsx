import React from 'react';
import './Header.css';
import logo from '../assets/profile.jpg';
import profileIcon from '../assets/PROFILEICON.png';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add'; 
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../context/AuthContext'; // Asegúrate que la ruta es correcta

const Header = ({
  onMenuClick,
  onLogoutClick,
  pokedexCount = 0 // Se añade un valor por defecto para seguridad
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Se obtienen ambos valores del contexto
  const { isLoggedIn, username } = useAuth(); 

  const handleTitleClick = () => {
    const path = location.pathname;
    if (path.startsWith('/general')) {
      navigate('/general');
    } else if (path.startsWith('/clasica')) {
      navigate('/clasica');
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="header-center">
        <span className="title" onClick={handleTitleClick} style={{ cursor: 'pointer', fontSize: '40px', fontWeight: 'normal'}}>
          Pokédex 2.0
        </span>
      </div>
      <div className="header-right">
        {isLoggedIn ? (
          <>
            <button
              className="header-button"
              title="Agregar Pokémon"
              onClick={() => navigate('/addPokemon')}
            >
              <AddIcon className="add-icon" />
              <span>Añadir Pokémon</span>
            </button>

            <button
              className="header-button"
              title="Favoritos"
            >
              <FavoriteIcon className="favourite-icon" />
              <span>Favoritos</span>
            </button>
            
            <img src={profileIcon} alt="Perfil" className="avatar" />
            <div className="user-info">
              {/* El username viene del contexto, no de una prop */}
              <span className="user-name">{username}</span> 
              <span className="pokedex-info">
                Pokédex: <span className="pokemon-count">{pokedexCount}</span>
              </span>
            </div>
            <button className="icon-button logout" title="Cerrar sesión" onClick={onLogoutClick}>
              <LogoutIcon style={{ color: 'white', fontSize: 24 }} />
            </button>
          </>
        ) : (
          <span
            className="login-link"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </span>
        )}
      </div>
      <div className="header-menu" onClick={onMenuClick}>
        <MenuIcon className="menu-icon" />
      </div>
    </div>
  );
};

export default Header;
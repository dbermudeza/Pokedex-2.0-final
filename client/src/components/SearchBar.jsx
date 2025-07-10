import React, { useState } from 'react';
import './SearchBar.css';
import filterRombo from '../assets/filter-rombo.png';
import sortRombo from '../assets/sort-rombo.png';

const SearchBar = ({ onFilter, onSortClick, onSearch }) => {
  const [input, setInput] = useState("");

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(input);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) onSearch(input);
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <div className="search-input-container" style={{ position: 'relative' }}>
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
              justifyContent: 'center'
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
        <button className="icon-button" onClick={onFilter} style={{ cursor: "pointer" }}>
          <img src={filterRombo} alt="Filtro" />
        </button>
        <button className="icon-button" onClick={onSortClick} style={{ cursor: "pointer" }}>
          <img src={sortRombo} alt="Ordenar" />
        </button>
        
      </div>
    </div>
  );
};

export default SearchBar;
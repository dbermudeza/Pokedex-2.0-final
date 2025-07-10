import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ViewTypeBar.css';

const ViewTypeBar = ({ viewType, onChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (type) => {
    onChange(type);

    // Obtén la ruta actual y reemplaza la primera parte
    const pathParts = location.pathname.split('/');
    // pathParts[0] es '', pathParts[1] es la sección principal
    if (type === 'general') {
      pathParts[1] = 'general';
    } else if (type === 'clasica') {
      pathParts[1] = 'clasica';
    }
    const newPath = pathParts.join('/') + location.search;
    navigate(newPath);
  };

  return (
    <div className="view-type-bar">
      <button
        className={`view-type-btn${viewType === 'general' ? ' active' : ''}`}
        onClick={() => handleChange('general')}
      >
        General
      </button>
      <button
        className={`view-type-btn${viewType === 'clasica' ? ' active' : ''}`}
        onClick={() => handleChange('clasica')}
      >
        Clásica
      </button>
    </div>
  );
};

export default ViewTypeBar;
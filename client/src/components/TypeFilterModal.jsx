import React from "react";
import "./TypeFilterModal.css"; // crea este archivo para estilos personalizados

const typeList = [
  "Planta", "Fuego", "Agua", "Eléctrico", "Hielo", "Lucha", "Veneno", "Tierra",
  "Volador", "Psíquico", "Bicho", "Roca", "Fantasma", "Dragón", "Siniestro", "Acero", "Hada", "Normal"
];

const TypeFilterModal = ({ selectedTypes, setSelectedTypes, onApply, onClose }) => {
  const handleToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="type-filter-modal-overlay">
      <div className="type-filter-modal-content">
        <h3 className="type-filter-title">Filtrar por tipo</h3>
        <div className="type-filter-list">
          {typeList.map(type => (
            <label key={type} className={`type-filter-item${selectedTypes.includes(type) ? " selected" : ""}`}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleToggle(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        <div className="type-filter-actions">
          <button className="type-filter-btn" onClick={onApply}>Aplicar</button>
          <button className="type-filter-btn cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default TypeFilterModal;
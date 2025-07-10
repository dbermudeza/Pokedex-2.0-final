import React from "react";
import "./SortModal.css";

const sortOptions = [
  { label: "ID Ascendente", value: "id-asc", icon: "arrow_upward" },
  { label: "ID Descendente", value: "id-desc", icon: "arrow_downward" },
  { label: "Nombre Ascendente", value: "name-asc", icon: "arrow_upward" },
  { label: "Nombre Descendente", value: "name-desc", icon: "arrow_downward" },
];

const SortModal = ({ show, sortType, onSelect, onClose }) => {
  if (!show) return null;

  return (
    <div className="sort-modal-overlay" onClick={onClose}>
      <div className="sort-modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="sort-modal-title">Ordenar por</h3>
        <div className="sort-modal-options">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              className={`sort-modal-btn${sortType === opt.value ? " selected" : ""}`}
              onClick={() => onSelect(opt.value)}
            >
              <span className="material-icons" style={{ marginRight: 8 }}>
                {opt.icon}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
        <button className="sort-modal-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default SortModal;
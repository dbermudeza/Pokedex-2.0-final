import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  // Este useEffect se ejecuta UNA SOLA VEZ cuando la app carga
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // Si encontramos un token y un usuario en localStorage,
    // actualizamos el estado para reflejar la sesión iniciada.
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUsername(JSON.parse(storedUser).nombre);
    }
  }, []); // El array vacío [] es la clave para que se ejecute solo al inicio

  const value = { isLoggedIn, setIsLoggedIn, username, setUsername };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
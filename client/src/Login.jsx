import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

function Login({ onLoginClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir recarga

    if (username.trim() === '' || password.trim() === '') {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setIsLoggedIn(true); // Marca como logueado
    navigate('/general'); // Redirige
  };

  return (
    <div className="form-section login">
      <h1>Inicia sesión de tu Pokedex</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Correo o Usuario</label>
        </div>
        <div className="form-input">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Contraseña</label>
        </div>

        {error && <p className="error-message">{error}</p>}

        <input
          className="login-signup-buttons"
          type="submit"
          value="Iniciar Sesión"
        />
      </form>

      <div className="redirect">
        ¿No tienes una cuenta? <a href="/register">Crea una cuenta</a>
      </div>
    </div>
  );
}

export default Login;

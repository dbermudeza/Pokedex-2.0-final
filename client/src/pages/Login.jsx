import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

function Login() { // Se quitó la prop onLoginClick que no se usaba
  const [identifier, setIdentifier] = useState(''); // Cambiado de 'username' a 'identifier'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setIsLoggedIn, setUsername } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (identifier.trim() === '' || password.trim() === '') {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // --- AQUÍ ESTÁ EL CAMBIO ---
        // Se envía un objeto con 'identifier' en lugar de 'correo'
        body: JSON.stringify({ identifier: identifier, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setError('');
      setIsLoggedIn(true);
      setUsername(data.user.nombre);
      navigate('/general');

    } catch (err) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="form-section login">
      <h1>Inicia sesión de tu Pokedex</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {/* La etiqueta ahora es más genérica */}
          <label>Correo o Usuario</label> 
        </div>

        <div className="form-input password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={`visibility-icon ${showPassword ? 'show-password' : 'hide-password'}`}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          ></button>
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

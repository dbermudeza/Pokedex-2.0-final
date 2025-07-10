import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForms.css';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  // Estados para todos los campos del formulario
  const [nombre, setName] = useState('');
  const [apellidos, setLastName] = useState('');
  const [correo, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [id, setUsername] = useState(''); // 'id' es el username
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setIsLoggedIn, setUsername: setAuthUsername } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones del frontend
    if (!nombre || !apellidos || !correo || !password || !confirmPassword || !id) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    if (password.length < 10) {
      setError('La contraseña debe tener al menos 10 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Enviar datos al endpoint de registro
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          correo,
          nombre,
          apellidos,
          password,
          genero,
          fecha_nacimiento: fechaNacimiento
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay un error (ej: usuario duplicado), lo mostramos
        throw new Error(data.error || 'Error en el registro');
      }

      // Si el registro es exitoso, el backend nos devuelve el token y el usuario
      // Iniciamos sesión guardando los datos
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Actualizamos el contexto y redirigimos
      setError('');
      setIsLoggedIn(true);
      setAuthUsername(data.user.nombre);
      navigate('/general');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-section signup">
      <h1>Crea una cuenta gratis</h1>
      <form onSubmit={handleSubmit}>
        <div id="register-wrapper">
          <div className="column">
            {/* ... Inputs para nombre, apellidos, correo, etc. ... */}
            <div id="fullname">
              <div className="form-input text">
                <input type="text" required value={nombre} onChange={(e) => setName(e.target.value)} />
                <label>Nombre</label>
              </div>
              <div className="form-input text">
                <input type="text" required value={apellidos} onChange={(e) => setLastName(e.target.value)} />
                <label>Apellidos</label>
              </div>
            </div>
            <div className="form-input text">
              <input type="email" required value={correo} onChange={(e) => setMail(e.target.value)} />
              <label>Correo electrónico</label>
            </div>
            <div className="form-input text">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <label>Contraseña</label>
            </div>
            <div className="form-input text">
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <label>Confirmar contraseña</label>
            </div>
          </div>
          <div className="column">
            <div className="form-input date">
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
              <label>Fecha de nacimiento</label>
            </div>
            <div className="form-input select">
              <select value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="">Sexo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
            <div className="form-input blank-space"></div>
            <div className="form-input text">
              <input type="text" required value={id} onChange={(e) => setUsername(e.target.value)} />
              <label>Crea un usuario único</label>
            </div>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <input className="login-signup-buttons" type="submit" value="Empezar ahora" />
      </form>
      <div className="redirect">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login">Inicia sesión aquí</Link>
      </div>
    </div>
  );
};

export default Register;

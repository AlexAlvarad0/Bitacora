import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../images/ORIGINAL SECUNDARIO-01.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
      localStorage.setItem('token', response.data.access);
      navigate('/formulario');
    } catch (error) {
      console.error('Error logging in', error);
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-form">
          <div className="title-section">
            <h1>Inicio de Sesión</h1>
            
          </div>
          
          <div className="input-group">
            <label>NOMBRE DE USUARIO</label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>CONTRASEÑA</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button className="login-button" onClick={handleLogin}>
            Iniciar Sesión
          </button>

        </div>
        
        <div className="welcome-side">
          <h2>Registro de Bitácora TC</h2>
          <img 
          src={logo} 
          alt='Logo' 
          style={{ width: '15vw', height: 'auto' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
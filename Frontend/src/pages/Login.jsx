import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../images/ORIGINAL SECUNDARIO-01.png';
import '../styles/botoninisesion.css';
import '../styles/fonts.css';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Snackbar, Alert } from '@mui/material';
import ClickSpark from '../components/ClickSpark';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openError, setOpenError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/formulario');
    } catch (error) {
      console.error('Error logging in', error);
      setOpenError(true);

    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <ClickSpark sparkColor='#fff' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400} />
      <div className="login-card">
        <div className="login-form">
          <div className="title-section">
            <h1>Inicio de Sesión</h1>
            
          </div>
          
          <div className="input-group">
          <PersonIcon />
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <div className="input-group">
          <LockIcon />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </div>
          </div>
          
          <buttonn onClick={handleLogin}>
            Iniciar Sesión
              <div className="arrow-wrapper">
                <div className="arrow"></div>
              </div>
          </buttonn>

        </div>
        
        <div className="welcome-side">
          <h2>Registro Bitácora Torre de Control Rosario</h2>

          <img 
          src={logo} 
          alt='Logo' 
          style={{ width: '15vw', height: 'auto' }} />
        </div>
      </div>
      <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          Credenciales incorrectas
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
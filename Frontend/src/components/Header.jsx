import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import logo from '../images/ORIGINAL SECUNDARIO-01.png'; // Importar el logo
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import '../pages/Login';
import '../styles/fonts.css'; 
import '../styles/logout-button.css';
const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No estás autenticado.');
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/user/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  const full_name = userData ? `${userData.first_name} ${userData.last_name}` : 'Cargando...';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AppBar position="static" color="primary" sx={{ backgroundColor:'#003087'}}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {/* Logo and Title - Left side */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={logo} alt="Logo" style={{ width: '70px', marginRight: '10px' }} />
    <h2 style={{ fontFamily: 'Gotham-Bold, sans-serif' }}>Registro Bitácora TC</h2>
  </div>

  {/* Centered Username */}
  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
    <MenuItem style={{ fontFamily: 'Gotham-Bold, sans-serif' }}>¡Bienvenido {full_name}!</MenuItem>
  </div>

  {/* Logout Button - Right side */}
  <div>
      <MenuItem 
        onClick={handleLogout} 
        disableRipple 
        sx={{ 
          padding: 0, 
          '&:hover': { 
            backgroundColor: 'transparent' 
          } 
        }}
      >
        <button className="Btn">
          <div className="sign">
            <svg viewBox="0 0 512 512">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
          </div>
          <div className="text">Salir</div>
        </button>
      </MenuItem>

  </div>
</Toolbar>
    </AppBar>
  );
};

export default Header;
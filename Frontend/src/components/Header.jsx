import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import logo from '../images/ORIGINAL SECUNDARIO-01.png'; // Importar el logo
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo y Título */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: '70px', marginRight: '10px' }} />
          <Typography variant="h6">Registro Bitácora TC</Typography>
        </div>

        {/* Barra de Navegación */}
        <div style={{ flexGrow: 1, marginLeft: '400px' }}>

        </div>

        {/* Usuario y Menú Desplegable */}
        <div>
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            size="large"
            edge="end"
            color="inherit"
          >
            <MenuItem>{full_name}</MenuItem >
            <Avatar>{full_name.charAt(0)}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            
            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
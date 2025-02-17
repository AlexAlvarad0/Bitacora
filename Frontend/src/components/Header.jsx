import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Sidebar, Menu, MenuItem, useProSidebar } from 'react-pro-sidebar';
import { FiFileText, FiBarChart2, FiTable, FiLogOut } from 'react-icons/fi';
import logo from '../images/ORIGINAL SECUNDARIO-01.png';
import 'animate.css';
import '../styles/fonts.css'; 
import '../styles/sidebar.css';

const Header = () => {
  const { collapseSidebar, collapsed } = useProSidebar();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (collapsed) {
      collapseSidebar(false);
    }
  };

  const handleMouseLeave = () => {
    if (!collapsed) {
      collapseSidebar(true);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div 
      className="sidebar-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        height: '100vh',
        position: 'fixed',
        zIndex: 1000,
        padding: '10px 0',
        boxSizing: 'border-box'
      }}
    >
      <Sidebar 
        width="250px" 
        collapsedWidth="80px"
        backgroundColor="#f8f9fa"
        rootStyles={{
          height: '100%',
          border: 'none',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Section - Fixed height */}
        <Box 
          sx={{ 
            padding: collapsed ? '20px' : '20px', 
            textAlign: 'center', 
            backgroundColor: '#003087',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: collapsed ? '80px' : '80px',
            boxSizing: 'border-box'
          }}
        >
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: collapsed ? '50px' : '80px', 
              marginBottom: collapsed ? '10px' : '10px',
              transition: 'width 0.3s'
            }} 
          />
          {!collapsed && (
            <Typography 
              variant="subtitle1" 
              color="white" 
              sx={{ 
                fontFamily: 'Gotham-Bold, sans-serif',
                textAlign: 'center',
                fontSize: '1rem',
                marginBottom: '10px'
              }}
            >
              ¡Hola {userData?.first_name}!
            </Typography>
          )}
        </Box>

        {/* Container for Menu and User Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: 'calc(100% - 80px)', // Subtract header height
          position: 'relative'
        }}>
          
          {/* Menu Items - Fixed position relative to top */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            marginTop: collapsed ? '0px' : 0
          }}>
            <Menu 
              menuItemStyles={{
                button: ({ level, active }) => ({
                  backgroundColor: active ? 'rgba(0, 48, 135, 0.1)' : undefined,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 48, 135, 0.05)',
                  },
                  fontFamily: 'Gotham-Medium, sans-serif',
                  height: '50px', // Fixed height for menu items
                }),
                icon: {
                  color: '#003087',
                },
              }}
            >
              <MenuItem 
                component={<Link to="/formulario" />}
                icon={<FiFileText />}
              >
                Formulario
              </MenuItem>
              
              <MenuItem 
                component={<Link to="/analisis" />}
                icon={<FiBarChart2 />}
              >
                Análisis
              </MenuItem>
              
              <MenuItem 
                component={<Link to="/tabla" />}
                icon={<FiTable />}
              >
                Tabla
              </MenuItem>
            </Menu>
          </Box>

          {/* Footer / Logout Section - Fixed at bottom */}
          <Box 
            sx={{
              padding: '10px',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#f8f9fa',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Button
              onClick={handleLogout}
              startIcon={<FiLogOut />}
              variant="contained"
              color="error"
              fullWidth
              sx={{ 
                minWidth: collapsed ? '40px' : '120px',
                height: '40px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                padding: collapsed ? '8px' : '8px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                '& .MuiButton-startIcon': {
                  marginRight: collapsed ? 0 : 1,
                  marginLeft: collapsed ? 0 : -0.5
                }
              }}
            >
              {!collapsed && 'Cerrar sesión'}
            </Button>
          </Box>
        </Box>
      </Sidebar>
    </div>
  );
};

export default Header;
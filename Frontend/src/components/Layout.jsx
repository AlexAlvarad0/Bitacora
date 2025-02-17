import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Espacio para el sidebar */}
        <Box sx={{ width: '80px', flexShrink: 0 }} />
        
        {/* Contenido principal */}
        <Box sx={{ 
          flexGrow: 1, 
          pl: { sm: '170px' },
          transition: 'padding 0.3s',
          pt: 4,
          pb: 4
        }}>
          <Container 
            maxWidth="xl" 
            sx={{ 
              mb: 4,
              '& .MuiPaper-root': {
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                p: 3
              }
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Layout;

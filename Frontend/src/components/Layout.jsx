import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Header />
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default
      }}>
        <Box sx={{ width: '0px', flexShrink: 0 }} />
        
        <Box sx={{ 
          flexGrow: 1, 
          pl: { sm: '0px' },
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
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                p: 3
              }
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

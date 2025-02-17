import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import Header from './Header';
import Layout from './Layout';

const TablaRegistros = () => {
  const [data, setData] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { 
      field: 'Fecha y Hora', 
      headerName: 'Fecha y Hora', 
      width: 180,
      valueGetter: (params) => {
        return params.row ? String(params.row['Fecha y Hora'] || '') : '';
      }
    },
    { 
      field: 'Tipo Notificación', 
      headerName: 'Tipo Notificación', 
      width: 150,
      valueGetter: (params) => params.row ? String(params.row['Tipo Notificación'] || '') : ''
    },
    { 
      field: 'Sentido', 
      headerName: 'Sentido', 
      width: 130,
      valueGetter: (params) => params.row ? String(params.row['Sentido'] || '') : ''
    },
    { 
      field: 'Canal de Comunicación', 
      headerName: 'Canal', 
      width: 130,
      valueGetter: (params) => params.row ? String(params.row['Canal de Comunicación'] || '') : ''
    },
    { 
      field: 'Emisor', 
      headerName: 'Emisor', 
      width: 180,
      valueGetter: (params) => params.row ? String(params.row['Emisor'] || '') : ''
    },
    { 
      field: 'Área', 
      headerName: 'Área', 
      width: 150,
      valueGetter: (params) => params.row ? String(params.row['Área'] || '') : ''
    },
    { 
      field: 'Unidad', 
      headerName: 'Unidad', 
      width: 130,
      valueGetter: (params) => params.row ? String(params.row['Unidad'] || '') : ''
    },
    { 
      field: 'Indicador', 
      headerName: 'Indicador', 
      width: 150,
      valueGetter: (params) => params.row ? String(params.row['Indicador'] || '') : ''
    },
    { 
      field: 'Valor %', 
      headerName: 'Valor %', 
      width: 100,
      type: 'number',
      valueGetter: (params) => params.row && params.row['Valor %'] !== undefined ? Number(params.row['Valor %']) : null
    },
    { 
      field: 'Desviación', 
      headerName: 'Desviación', 
      width: 120,
      valueGetter: (params) => params.row ? String(params.row['Desviación'] || '') : '',
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: 
              params.value === 'D1' ? '#C6EFCE' :
              params.value === 'D2' ? '#FFFF00' :
              params.value === 'D3' ? '#FFA500' :
              params.value === 'D4' ? '#FF0000' : 
              'transparent',
            padding: '6px 16px',
            borderRadius: '16px',
            color: params.value === 'D1' || params.value === 'D2' ? 'black' : 'white',
            width: '80%',
            textAlign: 'center'
          }}
        >
          {params.value}
        </Box>
      )
    },
    { 
      field: 'Hora de Desviación', 
      headerName: 'Hora Desv.', 
      width: 120,
      valueGetter: (params) => params.row ? String(params.row['Hora de Desviación'] || '') : ''
    },
    { 
      field: 'Respuesta', 
      headerName: 'Respuesta', 
      width: 100,
      valueGetter: (params) => params.row ? String(params.row['Respuesta'] || '') : ''
    },
    { 
      field: 'SKU', 
      headerName: 'SKU', 
      width: 100,
      valueGetter: (params) => params.row ? String(params.row['SKU'] || '') : ''
    },
    { 
      field: 'Producto', 
      headerName: 'Producto', 
      width: 200,
      valueGetter: (params) => params.row ? String(params.row['Producto'] || '') : ''
    },
    { 
      field: 'Receptor', 
      headerName: 'Receptor', 
      width: 180,
      valueGetter: (params) => params.row ? String(params.row['Receptor'] || '') : ''
    },
    { 
      field: 'Observaciones', 
      headerName: 'Observaciones', 
      width: 300,
      valueGetter: (params) => params.row ? String(params.row['Observaciones'] || '') : ''
    },
  ];

  // Función para mostrar detalle de los datos
  const showDataDetails = () => {
    console.log("Raw API Response:", rawResponse);
    console.log("Processed Data:", data);
    
    if (rawResponse && rawResponse.data) {
      console.log("API Response Structure:", {
        hasData: Boolean(rawResponse.data.data),
        dataIsArray: Array.isArray(rawResponse.data.data),
        dataLength: Array.isArray(rawResponse.data.data) ? rawResponse.data.data.length : 'N/A',
        firstRow: Array.isArray(rawResponse.data.data) && rawResponse.data.data.length > 0 
          ? rawResponse.data.data[0] 
          : 'No hay filas'
      });
    }
    
    // Si tenemos datos procesados, imprimimos el detalle de las primeras filas
    if (data.length > 0) {
      console.log("First Row Keys:", Object.keys(data[0]));
      console.log("First 3 Rows:", data.slice(0, 3));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/bitacora/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Guardar la respuesta completa para depuración
        setRawResponse(response);
        
        console.log("API Response:", response);
        
        // Validación básica de la estructura de datos
        if (response.data && Array.isArray(response.data.data)) {
          const dataWithIds = response.data.data
            .filter(row => row !== undefined && row !== null)
            .map((row, index) => ({
              ...row,
              id: index
            }));
          
          setData(dataWithIds);
          console.log("Processed Data:", dataWithIds);
        } else {
          // Handle case where data isn't in expected format
          console.error('Formato de datos inesperado:', response.data);
          setError('Error en el formato de datos recibidos. Revisa la consola para más detalles.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="outlined" onClick={showDataDetails} sx={{ mt: 2 }}>
          Mostrar Detalles en Consola
        </Button>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Gotham-Bold, sans-serif',
              color: '#003087'
            }}
          >
            Registros de Bitácora
          </Typography>
          <Button variant="outlined" onClick={showDataDetails}>
            Debug Data
          </Button>
        </Box>
        
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                color: 'black',
                py: 1,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 48, 135, 0.04)'
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              }
            }}
          />
        </Box>
      </Paper>
    </Layout>
  );
};

export default TablaRegistros;
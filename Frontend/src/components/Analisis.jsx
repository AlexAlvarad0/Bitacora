import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import moment from 'moment';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Analisis = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapping of areas to management, similar to Streamlit script
  const AREAS_POR_GERENCIA = {
    "Administración": [
      "Abastecimiento", "Administración", 
      "Control de Producción", "Servicios", 
      "Torre de Control"
    ],
    "Calidad": ["Calidad"],
    "Despacho": ["Despacho"],
    "Gerencia Planta": ["General"],
    "Mantenimiento": ["Mantenimiento"],
    "Personas": ["Personas"],
    "Producción": [
      "Congelado", "Cortes Especiales", 
      "Desposte", "Faena", "Producción"
    ],
    "Producción Animal": ["Producción Animal"]
  };

  // Mapping of areas to management, flattened for easy lookup
  const AREA_A_GERENCIA = Object.fromEntries(
    Object.entries(AREAS_POR_GERENCIA).flatMap(([gerencia, areas]) => 
      areas.map(area => [area, gerencia])
    )
  );

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
  
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/bitacora/', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const apiData = response.data.data || response.data;
        const processedData = apiData.map(item => ({
          ...item,
          'Fecha y Hora': new Date(item['Fecha y Hora']),
          // Add checks to replace problematic float values
          ...Object.fromEntries(
            Object.entries(item).map(([key, value]) => [
              key, 
              (typeof value === 'number' && (isNaN(value) || !isFinite(value))) 
                ? null 
                : value
            ])
          )
        }));
  
        console.log("Processed Data:", processedData); // Verifica los datos recibidos

        setData(processedData);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token is invalid, clear it and redirect to login
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        throw error;
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data for last 7 days
  const getLast7DaysData = () => {
    const sevenDaysAgo = moment().subtract(7, 'days').startOf('day').toDate();
    return data.filter(row => row['Fecha y Hora'] >= sevenDaysAgo);
  };

  // Prepare Bar Chart Data for D3 and D4 Deviations
  const getBarChartData = () => {
    const last7DaysData = getLast7DaysData();
    const d3d4Deviations = last7DaysData.filter(row => ['D3', 'D4'].includes(row['Desviación']));
    
    const deviationCounts = d3d4Deviations.reduce((acc, row) => {
      acc[row['Desviación']] = (acc[row['Desviación']] || 0) + 1;
      return acc;
    }, {});
  
    // Ensure both D3 and D4 are represented, even if count is 0
    if (!deviationCounts['D3']) deviationCounts['D3'] = 0;
    if (!deviationCounts['D4']) deviationCounts['D4'] = 0;
  
    return {
      labels: ['D3', 'D4'],
      datasets: [{
        label: 'Cantidad de Desviaciones',
        data: [deviationCounts['D3'], deviationCounts['D4']],
        backgroundColor: ['#FFA500', '#FF0000']
      }]
    };
  };

  // Prepare Pie Chart Data for Deviations by Management
  const getPieChartData = () => {
    const last7DaysData = getLast7DaysData();
    
    // Map areas to management
    const deviationsByGerencia = last7DaysData.reduce((acc, row) => {
      const gerencia = AREA_A_GERENCIA[row['Área']] || 'Otros';
      acc[gerencia] = (acc[gerencia] || 0) + 1;
      return acc;
    }, {});
  
    return {
      labels: Object.keys(deviationsByGerencia),
      datasets: [{
        data: Object.values(deviationsByGerencia),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', 
          '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }]
    };
  };

  // Refresh data handler
  const handleRefresh = () => {
    fetchData();
  };

  return (
    <>
      <Header />
      <Box sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Análisis de Desviaciones
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleRefresh}
          disabled={loading}
          sx={{ marginBottom: '20px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Actualizar Datos'}
        </Button>

        {error && (
          <Typography color="error" sx={{ marginBottom: '20px' }}>
            {error}
          </Typography>
        )}

        {!loading && data.length === 0 ? (
          <Typography color="text.secondary">
            No hay datos disponibles
          </Typography>
        ) : (
          <>
            <Box sx={{ marginBottom: '40px' }}>
              <Typography variant="h6">Desviaciones D3 y D4 (últimos 7 días)</Typography>
              <Bar 
                data={getBarChartData()} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                  },
                }} 
              />
            </Box>

            <Box>
              <Typography variant="h6">
                Desviaciones Agrupadas por Gerencia (últimos 7 días)
              </Typography>
              <Pie 
                data={getPieChartData()} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                  },
                }} 
              />
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default Analisis;
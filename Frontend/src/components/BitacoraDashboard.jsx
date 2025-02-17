import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  TextField, 
  Chip,
  CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from './Header';
import Layout from './Layout';
import "../styles/fonts.css";

const BitacoraDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDesviaciones, setSelectedDesviaciones] = useState(['D1', 'D2', 'D3', 'D4']); // Nuevo estado
  const [filteredData, setFilteredData] = useState([]);
  const [desviacionesPorDia, setDesviacionesPorDia] = useState([]);
  const [desviacionesPorArea, setDesviacionesPorArea] = useState([]);

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/bitacora/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Formatear fechas y guardar datos
        const formattedData = response.data.data.map(item => ({
          ...item,
          fecha: dayjs(item['Fecha y Hora'], 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD'),
          fechaCompleta: item['Fecha y Hora']
        }));
        
        setData(formattedData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Actualizar el useEffect de filtrado
  useEffect(() => {
    if (data.length === 0) return;
    
    let filtered = data;
    
    if (selectedDates.length > 0) {
      const fechasSeleccionadas = selectedDates.map(date => date.format('YYYY-MM-DD'));
      filtered = filtered.filter(item => fechasSeleccionadas.includes(item.fecha));
    }

    if (selectedDesviaciones.length > 0) {
      filtered = filtered.filter(item => selectedDesviaciones.includes(item.Desviación));
    }
    
    setFilteredData(filtered);
    procesarDatosPorDia(filtered);
    procesarDatosPorArea(filtered);
  }, [selectedDates, selectedDesviaciones, data]);

  // Procesar datos para el gráfico de desviaciones por día
  const procesarDatosPorDia = (data) => {
    // Agrupar por fecha y contar desviaciones
    const desviacionesPorFecha = {};
    
    data.forEach(item => {
      const fecha = dayjs(item.fechaCompleta, 'DD-MM-YYYY HH:mm:ss').format('DD/MM/YYYY');
      
      if (!desviacionesPorFecha[fecha]) {
        desviacionesPorFecha[fecha] = { fecha, D1: 0, D2: 0, D3: 0, D4: 0 };
      }
      
      if (item.Desviación && ['D1', 'D2', 'D3', 'D4'].includes(item.Desviación)) {
        desviacionesPorFecha[fecha][item.Desviación]++;
      }
    });
    
    setDesviacionesPorDia(Object.values(desviacionesPorFecha));
  };
  
  // Modificar la función procesarDatosPorArea
  const procesarDatosPorArea = (data) => {
    // Agrupar por área y contar total de desviaciones
    const areaDesviaciones = {};
    
    data.forEach(item => {
      if (!item.Área) return;
      
      if (!areaDesviaciones[item.Área]) {
        areaDesviaciones[item.Área] = {
          name: item.Área,
          value: 0,
          D1: 0,
          D2: 0,
          D3: 0,
          D4: 0
        };
      }
      
      if (item.Desviación && ['D1', 'D2', 'D3', 'D4'].includes(item.Desviación)) {
        areaDesviaciones[item.Área].value++;
        areaDesviaciones[item.Área][item.Desviación]++;
      }
    });
    
    setDesviacionesPorArea(Object.values(areaDesviaciones));
  };

  // Manejar selección de fechas
  const handleDateChange = (date) => {
    if (!date) {
      setSelectedDates([]);
      return;
    }

    if (selectedDates.find(d => d.isSame(date, 'day'))) {
      // Remover la fecha si ya está seleccionada
      setSelectedDates(selectedDates.filter(d => !d.isSame(date, 'day')));
    } else {
      // Agregar la fecha si no está seleccionada
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Agregar manejador para las desviaciones
  const handleDesviacionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDesviaciones(typeof value === 'string' ? value.split(',') : value);
  };

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
      <Container>
        <Typography variant="h6" color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Layout>
      <Paper sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: 'Gotham-Bold, sans-serif',
            color: '#003087',
            mb: 3
          }}
        >
          Análisis de Desviaciones
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                label="Seleccionar fecha"
                value={null}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="desviaciones-label">Desviaciones</InputLabel>
              <Select
                labelId="desviaciones-label"
                id="desviaciones-select"
                multiple
                value={selectedDesviaciones}
                onChange={handleDesviacionChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value}
                        sx={{
                          bgcolor: value === 'D1' ? '#C6EFCE' :
                                  value === 'D2' ? '#FFFF00' :
                                  value === 'D3' ? '#FFA500' :
                                  value === 'D4' ? '#FF0000' : 'default',
                          color: value === 'D1' || value === 'D2' ? 'black' : 'white'
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {['D1', 'D2', 'D3', 'D4'].map((desviacion) => (
                  <MenuItem key={desviacion} value={desviacion}>
                    <Chip 
                      label={desviacion}
                      sx={{
                        bgcolor: desviacion === 'D1' ? '#C6EFCE' :
                                desviacion === 'D2' ? '#FFFF00' :
                                desviacion === 'D3' ? '#FFA500' :
                                desviacion === 'D4' ? '#FF0000' : 'default',
                        color: desviacion === 'D1' || desviacion === 'D2' ? 'black' : 'white'
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSelectedDates([]);
                setSelectedDesviaciones(['D1', 'D2', 'D3', 'D4']);
              }}
              disabled={selectedDates.length === 0 && selectedDesviaciones.length === 4}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>
        
        {/* Mostrar fechas seleccionadas */}
        {selectedDates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Fechas seleccionadas:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedDates.map((date, index) => (
                <Chip 
                  key={index} 
                  label={date.format('DD/MM/YYYY')} 
                  onDelete={() => setSelectedDates(selectedDates.filter((_, i) => i !== index))}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Gráficos */}
      <Grid container spacing={4}>
        {/* Gráfico de desviaciones por día */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Desviaciones por Día
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={desviacionesPorDia}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="D1" fill="#C6EFCE" name="Desviación D1" />
                <Bar dataKey="D2" fill="#FFFF00" name="Desviación D2" />
                <Bar dataKey="D3" fill="#FFA500" name="Desviación D3" />
                <Bar dataKey="D4" fill="#FF0000" name="Desviación D4" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Reemplazar el BarChart de desviaciones por área con este PieChart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Desviaciones por Área
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `Total: ${value}
                     D1: ${props.payload.D1}
                     D2: ${props.payload.D2}
                     D3: ${props.payload.D3}
                     D4: ${props.payload.D4}`,
                    name
                  ]}
                />
                <Legend />
                <Pie
                  data={desviacionesPorArea}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {desviacionesPorArea.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={[
                        '#8884d8', '#82ca9d', '#ffc658', 
                        '#ff7300', '#a4de6c', '#d0ed57'
                      ][index % 6]} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default BitacoraDashboard;
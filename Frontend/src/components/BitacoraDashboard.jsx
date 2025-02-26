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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton, 
  ToggleButtonGroup,
  Popover
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import Layout from './Layout';
import "../styles/fonts.css";
import WeekPickerDay from './WeekPickerDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const BitacoraDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDesviaciones, setSelectedDesviaciones] = useState(['D1', 'D2', 'D3', 'D4']); // Nuevo estado
  const [filteredData, setFilteredData] = useState([]);
  const [desviacionesPorDia, setDesviacionesPorDia] = useState([]);
  const [desviacionesPorArea, setDesviacionesPorArea] = useState([]);
  const [selectedArea, setSelectedArea] = useState(''); // Nuevo estado para el área
  const [areas, setAreas] = useState([]); // Nuevo estado para las áreas disponibles
  const [topIndicadores, setTopIndicadores] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState('days'); // 'days' or 'week'
  const [hoveredDay, setHoveredDay] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [filteredTopIndicadores, setFilteredTopIndicadores] = useState([]); // Agregar este estado

  // Modificar el useEffect de fetchData
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
        setTopIndicadores(response.data.top_indicadores); // Usar los datos procesados del backend
        setLoading(false);

        // Obtener áreas únicas
        const uniqueAreas = [...new Set(formattedData.map(item => item.Área).filter(area => area))];
        setAreas(uniqueAreas);
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

    if (selectedArea) {
      filtered = filtered.filter(item => item.Área === selectedArea);
    }
    
    setFilteredData(filtered);
    procesarDatosPorDia(filtered);
    procesarDatosPorArea(filtered);

    // Procesar top indicadores filtrados
    const indicadoresMap = new Map();

    filtered.forEach(item => {
      if (!item.Indicador) return;

      if (!indicadoresMap.has(item.Indicador)) {
        indicadoresMap.set(item.Indicador, {
          indicador: item.Indicador,
          areas: new Set(),
          total: 0,
          D1: 0,
          D2: 0,
          D3: 0,
          D4: 0
        });
      }

      const indicadorStats = indicadoresMap.get(item.Indicador);
      indicadorStats.areas.add(item.Área);
      indicadorStats.total++;
      if (item.Desviación) {
        indicadorStats[item.Desviación]++;
      }
    });

    // Convertir el Map a array y ordenar por total
    const processedIndicadores = Array.from(indicadoresMap.values())
      .map(item => ({
        ...item,
        areas: Array.from(item.areas).join(', ')
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    setFilteredTopIndicadores(processedIndicadores);
  }, [selectedDates, selectedDesviaciones, selectedArea, data]);

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

  // Remover la función procesarTopIndicadores ya que ahora los datos vienen del backend

  // Modificar handleDateChange para manejar múltiples semanas
  const handleDateChange = (date) => {
    if (!date) return;
  
    if (selectionMode === 'week') {
      const startOfWeek = date.startOf('week');
      const endOfWeek = date.endOf('week');
      const weekDates = [];
      let currentDate = startOfWeek;
  
      while (currentDate.isBefore(endOfWeek) || currentDate.isSame(endOfWeek)) {
        weekDates.push(currentDate);
        currentDate = currentDate.add(1, 'day');
      }
  
      // Verificar si la semana ya está seleccionada
      const weekIsSelected = weekDates.some(weekDate => 
        selectedDates.some(selectedDate => selectedDate.isSame(weekDate, 'day'))
      );
  
      if (weekIsSelected) {
        // Remover la semana
        setSelectedDates(selectedDates.filter(selectedDate => 
          !weekDates.some(weekDate => weekDate.isSame(selectedDate, 'day'))
        ));
      } else {
        // Agregar la semana
        setSelectedDates([...selectedDates, ...weekDates]);
      }
    } else {
      // Lógica original para selección de días
      if (selectedDates.find(d => d.isSame(date, 'day'))) {
        setSelectedDates(selectedDates.filter(d => !d.isSame(date, 'day')));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  // Agregar manejador para las desviaciones
  const handleDesviacionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDesviaciones(typeof value === 'string' ? value.split(',') : value);
  };

  // Manejar selección de área
  const handleAreaChange = (event) => {
    setSelectedArea(event.target.value);
  };

  // Add this function to check if a date is already selected
  const isDateSelected = (date) => {
    return selectedDates.some(selectedDate => selectedDate.isSame(date, 'day'));
  };

  // Add this new handler
  const handleSelectionModeChange = (event, newMode) => {
    if (newMode !== null) {
      setSelectionMode(newMode);
      setSelectedDates([]); // Clear selected dates when changing modes
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
      <Paper sx={{ mb: 4, p: 3 }}>
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
        <Grid container spacing={1} alignItems="center" justifyContent="space-between">
          <Grid item xs={10} md={2.8}>
            <Button
              fullWidth
              onClick={handleClick}
              sx={{
                height: '56px',
                borderRadius: '15px',
                border: '2px solid #e8e8e8',
                '&:hover': {
                  borderColor: '#0077ff',
                  backgroundColor: 'transparent',
                },
                justifyContent: 'space-between',
                padding: '15px',
                color: 'black',
              }}
              endIcon={<CalendarMonthIcon />}
            >
              {selectedDates.length > 0 
                ? `${selectedDates.length} fecha${selectedDates.length > 1 ? 's' : ''} seleccionada${selectedDates.length > 1 ? 's' : ''}` 
                : 'Seleccionar fechas'}
            </Button>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiPopover-paper': {
                  width: 'auto',
                  p: 1,
                  mt: 1,
                },
              }}
            >
              <Box sx={{ width: '100%', mb: 0 }}>
                <ToggleButtonGroup
                  value={selectionMode}
                  exclusive
                  onChange={handleSelectionModeChange}
                  aria-label="text alignment"
                  sx={{ width: '100%' }}
                >
                  <ToggleButton 
                    value="days" 
                    aria-label="días"
                    sx={{ width: '50%' }}
                  >
                    Días
                  </ToggleButton>
                  <ToggleButton 
                    value="week" 
                    aria-label="semana"
                    sx={{ width: '50%' }}
                  >
                    Semana
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DateCalendar
                  value={selectedDates[0] || null}
                  onChange={handleDateChange}
                  showDaysOutsideCurrentMonth
                  displayWeekNumber={selectionMode === 'week'}
                  slots={{
                    day: selectionMode === 'week' ? WeekPickerDay : undefined
                  }}
                  slotProps={{
                    day: selectionMode === 'week' 
                      ? {
                          selectedWeeks: selectedDates,
                          hoveredDay,
                          onPointerEnter: (event) => {
                            const dayStr = event.target.getAttribute('data-day');
                            if (dayStr) {
                              setHoveredDay(dayjs(dayStr));
                            }
                          },
                          onPointerLeave: () => setHoveredDay(null),
                          sx: {
                            margin: '2px',
                            height: 36,
                            width: 36,
                          }
                        }
                      : {
                          selectedDay: selectedDates,
                          sx: {
                            margin: '2px',
                            height: 36,
                            width: 36,
                            borderRadius: '50%',
                            '&.Mui-selected': {
                              backgroundColor: '#0095ff !important',
                              color: 'white !important',
                            },
                            '&:hover': {
                              backgroundColor: 'transparent',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'transparent',
                            },
                          }
                        }
                  }}
                />
              </LocalizationProvider>

              {selectedDates.length > 0 && (
                <Box sx={{ mt: 2 }}>
                </Box>
              )}
            </Popover>
          </Grid>
          <Grid item xs={12} md={2.8}>
            <FormControl fullWidth>
              <InputLabel id="desviaciones-label">Desviaciones</InputLabel>
              <Select
                labelId="desviaciones-label"
                id="desviaciones-select"
                sx={{
                  borderRadius: '15px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #e8e8e8',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0095ff',
                  },
                  '& .MuiSelect-select': {
                    padding: '15px',
                  },
                  '& .MuiChip-root': {
                    margin: '2px',
                  }
                }}
                label="Desviaciones"
                multiple
                value={selectedDesviaciones}
                onChange={handleDesviacionChange}
                renderValue={(selected) => (
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '30px'
                  }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value}
                        size="small"
                        sx={{
                          bgcolor: value === 'D1' ? '#C6EFCE' :
                                  value === 'D2' ? '#FDE208' :
                                  value === 'D3' ? '#FFA500' :
                                  value === 'D4' ? '#FF0000' : 'default',
                          color: "'black"
                        }}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5,
                    },
                  },
                }}
              >
                {['D1', 'D2', 'D3', 'D4'].map((desviacion) => (
                  <MenuItem key={desviacion} value={desviacion} sx={{ justifyContent: 'center' }}>
                    <Chip 
                      label={desviacion}
                      sx={{
                        bgcolor: desviacion === 'D1' ? '#C6EFCE' :
                                desviacion === 'D2' ? '#FDE208' :
                                desviacion === 'D3' ? '#FFA500' :
                                desviacion === 'D4' ? '#FF0000' : 'default',
                        color: 'black'
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.8}>
            <FormControl fullWidth>
              <InputLabel id="area-label">Área</InputLabel>
              <Select
                label="Área"
                sx={{
                  borderRadius: '15px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #e8e8e8',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0095ff',
                  },
                  '& .MuiSelect-select': {
                    padding: '15px',
                  }
                }}
                labelId="area-label"
                id="area-select"
                value={selectedArea}
                onChange={handleAreaChange}
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.8}>
            <Button 
              fullWidth
              sx={{ 
                color: 'red', 
                borderColor: 'red',
                height: '56px', // Para que coincida con la altura de los otros componentes
                borderRadius: '15px'
              }}
              variant="outlined" 
              onClick={() => {
                setSelectedDates([]);
                setSelectedDesviaciones(['D1', 'D2', 'D3', 'D4']);
                setSelectedArea('');
              }}
              disabled={selectedDates.length === 0 && selectedDesviaciones.length === 4 && !selectedArea}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>
        
        {/* Mostrar fechas seleccionadas */}
        {selectedDates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color=' #003087'>Fechas seleccionadas:</Typography>
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
            <Typography variant='h6' sx={{ 
            fontFamily: 'Gotham-Bold, sans-serif',
            color: '#000',
            mb: 2
          }}>
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
                <Bar dataKey="D2" fill="#FDE208" name="Desviación D2" />
                <Bar dataKey="D3" fill="#FFA500" name="Desviación D3" />
                <Bar dataKey="D4" fill="#FF0000" name="Desviación D4" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Reemplazar el BarChart de desviaciones por área con este PieChart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' sx={{ 
            fontFamily: 'Gotham-Bold, sans-serif',
            color: '#000',
            mb: 2
          }}>
              Desviaciones por Área
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <RechartsTooltip 
                  formatter={(value, name, props) => [
                    `Total: ${value}
                     D1: ${props.payload.D1}
                     D2: ${props.payload.D2}
                     D3: ${props.payload.D3}
                     D4: ${props.payload.D4}
                     (${((value / desviacionesPorArea.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(2)}%)`,
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
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(2)}%` : ''}
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

      {/* Después del último Grid de los gráficos */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography 
            variant='h6' 
            sx={{ 
              fontFamily: 'Gotham-Bold, sans-serif',
              color: '#000',
              mb: 2
            }}
          >
            Top 10 Indicadores más Frecuentes {selectedDates.length > 0 && '(Filtrado)'}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Indicador</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Áreas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: '#C6EFCE',
                      color: 'black'
                    }}
                  >
                    D1
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: '#FDE208',
                      color: 'black'
                    }}
                  >
                    D2
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: '#FFA500',
                      color: 'black'
                    }}
                  >
                    D3
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: '#FF0000',
                      color: 'black'
                    }}
                  >
                    D4
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTopIndicadores.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.indicador}
                    </TableCell>
                    <TableCell>{row.areas}</TableCell>
                    <TableCell align="center">{row.total}</TableCell>
                    <TableCell align="center">{row.D1}</TableCell>
                    <TableCell align="center">{row.D2}</TableCell>
                    <TableCell align="center">{row.D3}</TableCell>
                    <TableCell align="center">{row.D4}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Layout>
  );
};

export default BitacoraDashboard;
import React, { useState, useEffect} from 'react';
import '../styles/formulario.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import LoadingDots from './Loading';
import { Autocomplete } from '@mui/material';
import Header from './Header';
import CheckIcon from '@mui/icons-material/Check';
import '../styles/boton.css';

const Formulario = () => {
  const [skuOptions, setSkuOptions] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_notificacion: '',
    sentido: '',
    desviacion: '',
    canal_comunicacion: '',
    area: '',
    unidad: '',
    indicador: '',
    valor: '',
    hora_desviacion: '',
    respuesta: '',
    sku: '',
    producto: '',
    receptor: '',
    observaciones: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    const loadSkuData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No estás autenticado.');
          return;
        }
        const response = await fetch('http://127.0.0.1:8000/api/sku/', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`Error al cargar SKU: ${response.status}`);
        }
        const data = await response.json();
        setSkuOptions(data.skuOptions);
      } catch (error) {
        console.error('Error cargando SKU:', error);
      }
    };
    loadSkuData();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleValorChange = (value) => {
    // Eliminar el símbolo % si está presente
    const numericValue = value.replace('%', '');
    setFormData({ ...formData, valor: numericValue });
  };
  const areaUnidades = {
    "Abastecimiento": ["Armado de Cajas", "Bodega"],
    "Administración": ["Administración"],
    "Calidad": ["Aseguramiento de Calidad"],
    "Congelado": ["Cambio de Embalaje", "Carton Freezer", "Congelado", "Paletizado"],
    "Control de Producción": ["Control de Producción", "Informática", "Romana de Camiones"],
    "Cortes Especiales": ["Sala de Laminado", "Cortes Especiales", "Ecualizado", "Marinado", "Pimentado", "Porcionado"],
    "Despacho": ["Despacho"],
    "Desposte": ["Calibrado Fresco", "Desposte", "Rectificado"],
    "Faena": ["Butina", "Corrales", "Faena", "Lavado de Camiones"],
    "General": ["Estatus Planta RO", "Planta Rosario", "Resumen Semanal", "Skyview"],
    "Mantenimiento": ["Mantenimiento"],
    "Personas": ["Personas", "SSO"],
    "Producción": ["Cumplimiento de Producción"],
    "Producción Animal": ["Producción Animal", "Torre Producción Animal"],
    "Servicios": ["Servicios"],
    "Torre de Control": ["Torre de Control"]
  };

  const handleAreaChange = (value) => {
    setFormData({
      ...formData,
      area: value,
      unidad: '' // Resetear la unidad cuando cambia el área
    });
  };
  const validateForm = () => {
    const requiredFields = [
      'tipo_notificacion',
      'sentido',
      'desviacion',
      'canal_comunicacion',
      'area',
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`Complete el campo: ${field}`);
        return false;
      }
    }
    setErrorMessage('');
    return true;
  };
  // Manejador de envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) return; // Validar campos antes de enviar
  
    setIsLoading(true);
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      navigate('/');
      setIsLoading(false);
      return;
    }
  
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/formulario/',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Registro agregado correctamente');
  
      // Limpiar el formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          tipo_notificacion: '',
          sentido: '',
          desviacion: '',
          canal_comunicacion: '',
          area: '',
          unidad: '',
          indicador: '',
          valor: '',
          hora_desviacion: '',
          respuesta: '',
          sku: '',  // Asegurarse de que el SKU se esté limpiando
          producto: '',
          receptor: '',
          observaciones: '',
        });
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error enviando formulario', error);
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Header />
    <Box className= "form-container">
      <Typography variant="h5" gutterBottom>
        Formulario de Registro
      </Typography>
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid container spacing={3}>
          {/* Fila 1 */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" color=' #003087'>Tipo de Notificación</Typography>
            <RadioGroup
              row
              value={formData.tipo_notificacion}
              onChange={(e) => handleFieldChange('tipo_notificacion', e.target.value)}
              color='success'
            >
              {['Alerta', 'Aviso', 'Información'].map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option}  />
              ))}
            </RadioGroup>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" color=' #003087'>Sentido</Typography>
            <RadioGroup
              row
              value={formData.sentido}
              onChange={(e) => handleFieldChange('sentido', e.target.value)}
            >
              {['Envío', 'Recepción'].map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1"color=' #003087'>Desviación</Typography>
            <RadioGroup
              row
              value={formData.desviacion}
              onChange={(e) => handleFieldChange('desviacion', e.target.value)}
              
            >
              {['D1', 'D2', 'D3', 'D4'].map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </Grid>

          {/* Fila 2 */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Canal de Comunicación</InputLabel>
              <Select
                value={formData.canal_comunicacion}
                onChange={(e) => handleFieldChange('canal_comunicacion', e.target.value)}
                label="Canal de Comunicación"
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
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                {['Correo', 'Presencial', 'Radio', 'Teléfono Fijo', 'WhatsApp'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Área</InputLabel>
              <Select
                value={formData.area}
                onChange={(e) => handleFieldChange('area', e.target.value)}
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
                label="Área"
                
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                {[
                  'Abastecimiento',
                  'Administración',
                  'Calidad',
                  'Congelado',
                  'Control de Producción',
                  'Cortes Especiales',
                  'Despacho',
                  'Desposte',
                  'Faena',
                  'General',
                  'Mantenimiento',
                  'Personas',
                  'Producción',
                  'Producción Animal',
                  'Servicios',
                  'Torre de Control',
                ].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth disabled={!formData.area}>
              <InputLabel>Unidad</InputLabel>
              <Select
                value={formData.unidad}
                onChange={(e) => handleFieldChange('unidad', e.target.value)}
                label="Unidad"
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
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                  {formData.area && areaUnidades[formData.area].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Fila 3 */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Indicador"
              value={formData.indicador}
              onChange={(e) => handleFieldChange('indicador', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderRadius: '15px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0095ff',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '15px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Valor %"
              value={formData.valor ? `${formData.valor}%` : ''}
              onChange={(e) => handleValorChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderRadius: '15px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0095ff',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '15px',
                }
              }}
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Hora de Desviación"
              type="time" // Usamos el tipo "time" para el selector de hora
              value={formData.hora_desviacion}
              onChange={(e) => handleFieldChange('hora_desviacion', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderRadius: '15px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0095ff',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '15px',
                }
              }}
              InputLabelProps={{
                shrink: true, // Asegura que la etiqueta no se superponga al valor
              }}
              inputProps={{
                step: 300,
               // Incremento en segundos (5 minutos)
              }}
            />
          </Grid>

          {/* Fila 4 */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1">Respuesta</Typography>
            <RadioGroup
              row
              value={formData.respuesta}
              onChange={(e) => handleFieldChange('respuesta', e.target.value)}
            >
              {['Sí', 'No'].map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              
              <Autocomplete
                options={skuOptions.slice(1)} // Omitir la primera opción vacía
                getOptionLabel={(option) => option}
                value={formData.sku && formData.producto ? `${formData.sku} - ${formData.producto}` : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '15px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0077ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0095ff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '15px',
                  }
                }}
                onChange={(event, newValue) => {
                  if (newValue) {
                    const [sku, producto] = newValue.split(' - ');
                    handleFieldChange('sku', sku.trim());
                    handleFieldChange('producto', producto.trim());
                  } else {
                    handleFieldChange('sku', '');
                    handleFieldChange('producto', '');
                  }
                }}
                renderInput={(params) => (
                   <TextField {...params} 
                      label="SKU" 
                      placeholder='Buscar SKU...'
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Receptor"
              value={formData.receptor}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderRadius: '15px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0095ff',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '15px',
                }
              }}
              onChange={(e) => handleFieldChange('receptor', e.target.value)}
            />
          </Grid>

          {/* Fila 5 */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={formData.observaciones}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderRadius: '15px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0077ff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0095ff',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '15px',
                }
              }}
              onChange={(e) => handleFieldChange('observaciones', e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Botón de Guardar y Spinner */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
  {isLoading ? (
    <LoadingDots />
  ) : (
    <div className="buttons">
      <button onClick={handleSubmit}>
        <span></span>
        <p data-start="Guardando..." data-text="Guardar Registro" data-title="Guardar Registro"></p>
      </button>
    </div>
  )}
</Box>
        {/* Mensaje de éxito */}
        {successMessage && (
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
            <Typography variant="body1" color="green">
              {successMessage}
            </Typography>
          </Alert>
        )}
      </form>
    </Box>
  </>
  );
};

export default Formulario;
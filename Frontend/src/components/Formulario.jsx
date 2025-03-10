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
  Paper,
  IconButton
} from '@mui/material';
import LoadingDots from './Loading';
import { Autocomplete } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import '../styles/boton.css'
import CargaMasiva from './CargaMasiva';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import '../styles/btn.css';
import Layout from './Layout';
import Snackbar from '@mui/material/Snackbar';
import { autocorrectText } from '../utils/autocorrect';
import ClearIcon from '@mui/icons-material/Clear';
import Chip from '@mui/material/Chip';

const Formulario = () => {
  const [skuData, setSkuData] = useState([]); // Mantener los datos completos
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
  const [openCargaMasiva, setOpenCargaMasiva] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ open: false, message: '', type: 'success' });
  const [lastValue, setLastValue] = useState({});
  const [correctionTimeouts, setCorrectionTimeouts] = useState({});
  const [topIndicators, setTopIndicators] = useState([]);

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
        setSkuData(data.skuData); // Guardamos los datos completos
      } catch (error) {
        console.error('Error cargando SKU:', error);
      }
    };
    loadSkuData();
  }, []);

  useEffect(() => {
    const loadTopIndicators = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://127.0.0.1:8000/api/bitacora/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if(response.data.top_indicadores){
          setTopIndicators(response.data.top_indicadores.slice(0, 4));
        }
      } catch (error) {
        console.error('Error cargando indicadores principales', error);
      }
    };
    loadTopIndicators();
  }, []);

  const handleFieldChange = (field, value) => {
    if (['indicador', 'receptor', 'observaciones'].includes(field)) {
      // Cancelar timeout previo
      if (correctionTimeouts[field]) {
        clearTimeout(correctionTimeouts[field]);
      }

      // Actualizar el valor inmediatamente
      setFormData(prev => ({ ...prev, [field]: value }));

      // Si se está borrando, no hacer corrección
      if (value.length < (formData[field] || '').length) {
        return;
      }

      // Crear nuevo timeout para corrección
      const timeoutId = setTimeout(() => {
        if (value.endsWith(' ') || value.length > 0) {
          const correctedText = autocorrectText(value, field);
          if (correctedText !== value) {
            setFormData(prev => ({ ...prev, [field]: correctedText }));
          }
        }
      }, value.endsWith(' ') ? 200 : 800); // Reducido de 500/2000 a 200/800 ms

      setCorrectionTimeouts(prev => ({ ...prev, [field]: timeoutId }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleValorChange = (value) => {
    // Permitir solo números, coma y %
    const cleanValue = value.replace(/[^\d%,]/g, '');
    // Si es un número válido (permitiendo comas y %)
    if (cleanValue === '' || /^\d+,?\d*%?$/.test(cleanValue)) {
      setFormData({ ...formData, valor: cleanValue });
    }
  };

  const areaUnidades = {
    "Abastecimiento": ["Armado de Cajas", "Bodega"],
    "Administración" : ["Adminstración"],
    "Calidad": ["Aseguramiento de Calidad"],
    "Congelado": ["Cambio de Embalaje", "Carton Freezer", "Congelado", "Paletizado"],
    "Control de Producción": ["Control de Producción", "Informática", "Romana de Camiones"],
    "Cortes Especiales": ["Sala de Laminado","Calibrado Fresco", "Cortes Especiales", "Ecualizado", 
                         "Marinado", "Pimentado", "Porcionado"],
    "Despacho": ["Despacho"],
    "Desposte": ["Calibrado", "Desposte", "Rectificado"],
    "Faena": ["Butina", "Corrales", "Faena", "Lavado de Camiones", "Sub Productos"],
    "General" : ["Estatus Planta RO", "Planta Rosario", "Resumen Semanal", "Skyview"],
    "Mantenimiento": ["Mantenimiento"],
    "Personas": ["Personas", "SSO"],
    "Producción": ["Cumplimiento de Producción"],
    "Producción Animal": ["Producción Animal", "Torre Producción Animal"],
    "Servicios": ["Armado de Cajas","Calderas", "CIL","Riles", "SADEMA","Servicios"],
    "Torre de Control": ["Torre de Control"]
  };

  const handleAreaChange = (value) => {
    const unidades = areaUnidades[value] || [];
    setFormData({
      ...formData,
      area: value,
      // Si el área tiene una única subárea, la seleccionamos automáticamente
      unidad: unidades.length === 1 ? unidades[0] : ''
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
    const token = localStorage.getItem('token');
    if (!token) {
      setPopupMessage({
        open: true,
        message: 'No estás autenticado. Por favor, inicia sesión.',
        type: 'error'
      });
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
      
      setPopupMessage({
        open: true,
        message: 'Registro guardado exitosamente',
        type: 'success'
      });
  
      // Limpiar el formulario después del éxito
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
          sku: '',
          producto: '',
          receptor: '',
          observaciones: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error enviando formulario', error);
      setPopupMessage({
        open: true,
        message: 'El registro no fue enviado, asegúrese que la bitácora no esté abierta',
        type: 'error'
      });
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearField = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  // Agregar función para actualizar "indicador" desde chip sin autocorrector
  const handleIndicadorChipClick = (value) => {
    setFormData(prev => ({ ...prev, indicador: value }));
  };

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
            Formulario de Registro
          </Typography>
          <button className="button" onClick={() => setOpenCargaMasiva(true)}>
            <span className="button_lg">
              <span className="button_sl"></span>
              <span className="button_text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudUploadIcon sx={{ marginRight: '8px' }} />
                Carga Masiva
              </span>
            </span>
          </button>
        </Box>

        <CargaMasiva
          open={openCargaMasiva}
          onClose={() => setOpenCargaMasiva(false)}
          areaUnidades={areaUnidades}
        />

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
            <Grid item xs={12} sm={4}mt={-3}>
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
                  {['Radio','WhatsApp','Presencial','Teléfono Fijo','Correo', 'Microsoft Teams' ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}mt={-3}>
              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Select
                  value={formData.area}
                  onChange={(e) => handleAreaChange(e.target.value)} // Cambia esta línea
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
                  {Object.keys(areaUnidades).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}mt={-3}>
              <FormControl fullWidth disabled={!formData.area}>
                <InputLabel>Subárea</InputLabel>
                <Select
                  value={formData.unidad}
                  onChange={(e) => handleFieldChange('unidad', e.target.value)}
                  label="Subárea"
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
                InputProps={{
                  endAdornment: formData.indicador && (
                    <IconButton
                      aria-label="clear input"
                      onClick={() => handleClearField('indicador')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
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
              {/* Agregar etiquetas con los 5 indicadores principales */}
              {topIndicators.length > 0 && (
                <Box sx={{ mt: 0.5 }}>
                  {topIndicators.map((item, idx) => (
                    <Chip 
                      key={idx}
                      label={item.indicador}
                      onClick={() => handleIndicadorChipClick(item.indicador)}
                      sx={{ 
                        cursor: 'pointer', 
                        mr: 0.5,
                        fontSize: '0.8rem',      // Ajustar tamaño de texto
                        padding: '0px 1px',      // Ajustar padding
                        height: '20px'           // Ajustar altura
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Valor Desviación"
                value={formData.valor}
                onChange={(e) => handleValorChange(e.target.value)}
                onBlur={() => {
                  // Al perder el foco, asegurarse de que tenga el símbolo %
                  
                }}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
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
            <Grid item xs={12} sm={4}mt={-3}>
              <Typography variant="subtitle1" color=' #003087'>Respuesta</Typography>
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
            <Grid item xs={12} sm={4}mt={-3}>
              <FormControl fullWidth>
                
                <Autocomplete
                  options={skuData.map(item => ({ 
                    label: `${item.SKU} - ${item.Producto}`,
                    sku: item.SKU
                  }))}
                  value={formData.sku ? { label: `${formData.sku} - ${formData.producto}`, sku: formData.sku } : null}
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
                      handleFieldChange('sku', newValue.sku);
                    } else {
                      handleFieldChange('sku', '');
                    }
                  }}
                  getOptionLabel={(option) => option.label || ''}
                  renderInput={(params) => (
                    <TextField {...params} 
                      label="SKU" 
                      placeholder='Buscar SKU...'
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}mt={-3}>
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
                InputProps={{
                  endAdornment: formData.receptor && (
                    <IconButton
                      aria-label="clear input"
                      onClick={() => handleClearField('receptor')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            {/* Fila 5 */}
            <Grid item xs={12}mt={-3}>
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
      </Paper>
      <Snackbar
        open={popupMessage.open}
        autoHideDuration={4000}
        onClose={() => setPopupMessage({ ...popupMessage, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setPopupMessage({ ...popupMessage, open: false })} 
          severity={popupMessage.type} 
          sx={{ width: '100%' }}
        >
          {popupMessage.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Formulario;
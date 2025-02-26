import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,      
  IconButton,           
  CircularProgress  
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; 
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const CargaMasiva = ({ open, onClose }) => {
  const [baseData, setBaseData] = useState({
    tipo_notificacion: '',
    sentido: '',
    canal_comunicacion: '',
    indicador: '',
    area: '',           // New common field
    unidad: '',         // New common field
    receptor: '',       // New common field
    respuesta: '',      // New common field
    observaciones: ''   // New common field
  });
  const areaUnidades = {
    "Desposte": ["Calibrado Fresco", "Desposte", "Rectificado"],
    "Faena": ["Butina", "Corrales", "Faena", "Lavado de Camiones"],
    "Cortes Especiales": ["Sala de Laminado", "Cortes Especiales", "Ecualizado", 
                         "Marinado", "Pimentado", "Porcionado"]
  };
  const [rawSkus, setRawSkus] = useState('');
  const [rawValues, setRawValues] = useState('');
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ open: false, message: '', type: 'success' });

  const clearForm = () => {
    setBaseData({
      tipo_notificacion: '',
      sentido: '',
      canal_comunicacion: '',
      indicador: '',
      area: '',
      unidad: '',
      receptor: '',
      respuesta: '',
      observaciones: ''
    });
    setRawSkus('');
    setRawValues('');
    setRegistros([]);
  };

  const handleBaseDataChange = (field, value) => {
    setBaseData({ ...baseData, [field]: value });
  };

  const handleRegistroChange = (index, field, value) => {
    const newRegistros = [...registros];
    newRegistros[index] = { ...newRegistros[index], [field]: value };
    setRegistros(newRegistros);
  };

  const addNewRegistro = () => {
    setRegistros([...registros, {
      sku: '',
      respusta: '',
      valor: '',
      desviacion: '',
      hora_desviacion: '', // <-- Nuevo
      area: '',
      unidad: '',
      receptor: '',
      observaciones: '',
    }]);
  };

  const removeRegistro = (index) => {
    const newRegistros = registros.filter((_, i) => i !== index);
    setRegistros(newRegistros);
  };

  const parseData = (skusText, valuesText, indicador) => {
    try {
      const items = skusText.split('\n').filter(line => line.trim() !== '');
      const valuesAndDeviations = valuesText
        .split('\n')
        .filter(line => /^\d+[.,]\d+%?\s+D[1-4]\s+\d{2}:\d{2}$/i.test(line.trim()))
        .map(line => {
          const [value, deviation, hora] = line.trim().split(/\s+/);
          return {
            valor: value,
            desviacion: deviation.toUpperCase(),
            hora_desviacion: hora
          };
        });

      const newRegistros = items.map((item, index) => ({
        sku: indicador === 'Productos No Objetivos' || indicador === 'Productos Complementarios' || indicador === 'Valor Agregado' ? '' : item.trim(),
        producto: indicador === 'Productos No Objetivos' || indicador === 'Productos Complementarios' || indicador === 'Valor Agregado' ? item.trim() : '',
        valor: valuesAndDeviations[index]?.valor || '',
        desviacion: valuesAndDeviations[index]?.desviacion || '',
        hora_desviacion: valuesAndDeviations[index]?.hora_desviacion || ''
      }));

      setRegistros(newRegistros);
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setPopupMessage({ open: true, message: 'No hay token. Inicie sesión nuevamente.', type: 'error' });
        setIsLoading(false);
        return;
      }

      // Validate that all required common fields are filled
      if (!baseData.area || !baseData.unidad || !baseData.receptor) {
        setPopupMessage({ open: true, message: 'Complete todos los campos comunes requeridos', type: 'error' });
        setIsLoading(false);
        return;
      }

      const formattedData = registros.map(registro => ({
        ...registro,
        area: baseData.area,
        unidad: baseData.unidad,
        receptor: baseData.receptor,
        respuesta: baseData.respuesta,
        observaciones: baseData.observaciones,
        tipo_notificacion: baseData.tipo_notificacion,
        sentido: baseData.sentido,
        canal_comunicacion: baseData.canal_comunicacion,
        indicador: baseData.indicador
      }));

      const response = await axios.post(
        'http://127.0.0.1:8000/api/carga-masiva/',
        { registros: formattedData },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          } 
        }
      );

      setIsLoading(false);
      setPopupMessage({ open: true, message: 'Registros guardados exitosamente', type: 'success' });
      clearForm();
      onClose();
      
    } catch (error) {
      setIsLoading(false);
      setPopupMessage({
        open: true,
        message: 'El registro no fue enviado, asegúrese que la bitácora no esté abierta',
        type: 'error'
      });
      console.error('Error completo:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    }
  };

  return (
    <>
      {/* Loader */}
      {isLoading && (
        <div className="spinner center">
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
        </div>
      )}
      
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth> {/* Adjusted size */}
        <DialogTitle variant='h5' sx={{fontFamily:'Gotham-Bold, sans-serif', color:'#003087'}}>Carga Masiva de Registros</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
            {/* Datos comunes */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{fontFamily:'Gotham-Bold, sans-serif'}}> Datos Comunes</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color=' #003087'>Tipo de Notificación</Typography>
              <RadioGroup
                row
                value={baseData.tipo_notificacion}
                onChange={(e) => handleBaseDataChange('tipo_notificacion', e.target.value)}
              >
                {['Alerta', 'Aviso', 'Información'].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color=' #003087'>Sentido</Typography>
              <RadioGroup
                row
                value={baseData.sentido}
                onChange={(e) => handleBaseDataChange('sentido', e.target.value)}
              >
                {['Envío', 'Recepción'].map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Canal de Comunicación</InputLabel>
                <Select
                  value={baseData.canal_comunicacion}
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
                  onChange={(e) => handleBaseDataChange('canal_comunicacion', e.target.value)}
                  label="Canal de Comunicación"
                >
                  {['Radio','WhatsApp','Presencial','Teléfono Fijo','Correo', 'Microsoft Teams' ].map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Indicador</InputLabel>
                <Select
                  value={baseData.indicador}
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
                  onChange={(e) => handleBaseDataChange('indicador', e.target.value)}
                  label="Indicador"
                >
                  <MenuItem value="Cubicaje">Cubicaje</MenuItem>
                  <MenuItem value="Give Away">Give Away</MenuItem>
                  <MenuItem value="Productos No Objetivos">Productos No Objetivos</MenuItem>
                  <MenuItem value="Productos Complementarios">Productos Complementarios</MenuItem>
                  <MenuItem value="Valor Agregado">Valor Agregado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* New common fields */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Select
                  value={baseData.area}
                  onChange={(e) => handleBaseDataChange('area', e.target.value)}
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
                >
                  {Object.keys(areaUnidades).map((area) => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subárea</InputLabel>
                <Select
                  value={baseData.unidad}
                  onChange={(e) => handleBaseDataChange('unidad', e.target.value)}
                  label="Subárea"
                  disabled={!baseData.area}
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
                  {baseData.area && areaUnidades[baseData.area]?.map((unidad) => (
                    <MenuItem key={unidad} value={unidad}>{unidad}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Receptor"
                value={baseData.receptor}
                onChange={(e) => handleBaseDataChange('receptor', e.target.value)}
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

            <Grid item xs={12} sm={6} md={3}>
              <FormControl>
                <Typography variant="subtitle1" color="#003087" sx={{ mb: -1.5 }}>
                  Respuesta
                </Typography>
                <RadioGroup
                  row
                  value={baseData.respuesta}
                  onChange={(e) => handleBaseDataChange('respuesta', e.target.value)}
                  sx={{
                    justifyContent: 'flex-start',
                    '& .MuiFormControlLabel-root': {
                      marginLeft: 0,
                      marginRight: 2
                    }
                  }}
                >
                  {['Sí', 'No'].map((option) => (
                    <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                value={baseData.observaciones}
                onChange={(e) => handleBaseDataChange('observaciones', e.target.value)}
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

            {/* Campos de entrada de datos */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontFamily:'Gotham-Bold' }}>Datos a Cargar</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" color=' #003087' gutterBottom>{baseData.indicador === 'Productos No Objetivos' || baseData.indicador === 'Productos Complementarios' || baseData.indicador === 'Valor Agregado' ? 'Productos' : 'SKUs'}</Typography>
              <TextField
                fullWidth
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
                    padding: '10px',
                  }
                }}
                multiline
                rows={7}
                value={rawSkus}
                onChange={(e) => {
                  setRawSkus(e.target.value);
                  parseData(e.target.value, rawValues, baseData.indicador);
                }}
                placeholder={`Ejemplo:
${baseData.indicador === 'Productos No Objetivos' || baseData.indicador === 'Productos Complementarios' || baseData.indicador === 'Valor Agregado' ? 'Colas\nFémur\nCazuela' : '1021731\n1022748\n1023373'}`}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" color=' #003087' gutterBottom>Valores, Desviación y Hora</Typography>
              <TextField
                fullWidth
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
                    padding: '10px',
                  }
                }}
                multiline
                rows={7}
                value={rawValues}
                onChange={(e) => {
                  setRawValues(e.target.value);
                  parseData(rawSkus, e.target.value, baseData.indicador);
                }}
                placeholder={`Ejemplo:
2,23% D3 12:30
1,62% D3 13:45
2,50% D3 14:00`}
              />
            </Grid>

            {/* Registros generados */}
            {registros.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontFamily:'Gotham-Bold' }}>
                    Registros Detectados: {registros.length}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            clearForm();
            onClose();
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={
              isLoading ||
              registros.length === 0 ||
              !baseData.tipo_notificacion ||
              !baseData.sentido ||
              !baseData.canal_comunicacion ||
              !baseData.indicador
            }
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : `Guardar ${registros.length} Registros`}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Popup Message */}
      <Snackbar
        open={popupMessage.open}
        autoHideDuration={4000}
        onClose={() => setPopupMessage({ ...popupMessage, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setPopupMessage({ ...popupMessage, open: false })} severity={popupMessage.type} sx={{ width: '100%' }}>
          {popupMessage.message}
        </Alert>
      </Snackbar>
    </>
  );
};



export default CargaMasiva;

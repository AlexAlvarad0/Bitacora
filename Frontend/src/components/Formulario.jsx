import React, { useState } from 'react';
import '../styles/formulario.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
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
} from '@mui/material';
import {SyncLoader} from 'react-spinners';

const Formulario = () => {
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

  const [isLoading, setIsLoading] = useState(false); // Estado para el spinner
  const [successMessage, setSuccessMessage] = useState(''); 
  // Función para manejar cambios en los campos
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Función para formatear el valor como porcentaje
  const formatValue = (value) => {
    return `${value} %`;
  };

  // Manejador de envío del formulario
  const handleSubmit = async () => {
    setIsLoading(true); // Activar el spinner
    setSuccessMessage(''); // Limpiar mensajes anteriores

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      navigate('/');
      setIsLoading(false); // Desactivar el spinner si hay error
      return;
    }

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/formulario/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage('Formulario enviado exitosamente'); // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error enviando formulario', error);
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setIsLoading(false); // Desactivar el spinner al finalizar
    }
  };

  return (
    <Box className= "form-container">
      <Typography variant="h5" gutterBottom>
        Formulario de Registro
      </Typography>
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid container spacing={3}>
          {/* Fila 1 */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1">Tipo de Notificación</Typography>
            <RadioGroup
              row
              value={formData.tipo_notificacion}
              onChange={(e) => handleFieldChange('tipo_notificacion', e.target.value)}
            >
              {['Alerta', 'Aviso', 'Información'].map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1">Sentido</Typography>
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
            <Typography variant="subtitle1">Desviación</Typography>
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
            <FormControl fullWidth disabled={!formData.area || formData.area === ''}>
              <InputLabel>Unidad</InputLabel>
              <Select
                value={formData.unidad}
                onChange={(e) => handleFieldChange('unidad', e.target.value)}
                label="Unidad"
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                {formData.area &&
                  ['Armado de Cajas', 'Bodega'].map((option) => (
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
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Valor %"
              value={formData.valor}
              onChange={(e) => handleFieldChange('valor', formatValue(e.target.value))}
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
              InputLabelProps={{
                shrink: true, // Asegura que la etiqueta no se superponga al valor
              }}
              inputProps={{
                step: 300, // Incremento en segundos (5 minutos)
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
              <InputLabel>SKU</InputLabel>
              <Select
                value={`${formData.sku} - ${formData.producto}`}
                onChange={(e) => {
                  const [sku, producto] = e.target.value.split(' - ');
                  handleFieldChange('sku', sku);
                  handleFieldChange('producto', producto);
                }}
                label="SKU"
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                {['123 - Carne', '456 - Pollo', '789 - Cerdo'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Receptor"
              value={formData.receptor}
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
              onChange={(e) => handleFieldChange('observaciones', e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Botón de Guardar y Spinner */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
          {isLoading ? (
            <SyncLoader color="#005fb3" size={15} /> // Spinner mientras se carga
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Guardar Registro
            </Button>
          )}
        </Box>
        {/* Mensaje de éxito */}
        {successMessage && (
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Typography variant="body1" color="green">
              {successMessage}
            </Typography>
          </Box>
        )}
      </form>
    </Box>
  );
};

export default Formulario;
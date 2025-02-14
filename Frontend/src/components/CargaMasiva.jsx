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
  InputAdornment,      // <-- Nuevo
  IconButton,           // <-- Nuevo
  CircularProgress  // <-- Nuevo
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';  // <-- Nuevo
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const CargaMasiva = ({ open, onClose, areaUnidades }) => {
  const [baseData, setBaseData] = useState({
    tipo_notificacion: '',
    sentido: '',
    canal_comunicacion: '',
    indicador: '',
  });

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
      valor: '',
      desviacion: '',
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

  const parseData = (skusText, valuesText) => {
    try {
      const skus = skusText.split('\n').filter(line => /^\d+$/.test(line.trim()));
      const valuesAndDeviations = valuesText
        .split('\n')
        .filter(line => /^\d+[.,]\d+%?\s+D[1-4]$/i.test(line.trim()))
        .map(line => {
          const [value, deviation] = line.trim().split(/\s+/);
          return {
            valor: value.endsWith('%') ? value : value + '%',
            desviacion: deviation.toUpperCase()
          };
        });


      const newRegistros = skus.map((sku, index) => ({
        sku: sku.trim(),
        valor: valuesAndDeviations[index].valor,
        desviacion: valuesAndDeviations[index].desviacion,
        area: '',
        unidad: '',
        receptor: '',
        observaciones: '',
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

      // Validate that all required fields are filled
      const isValid = registros.every(registro => 
        registro.area && 
        registro.unidad && 
        registro.receptor
      );

      if (!isValid) {
        setPopupMessage({ open: true, message: 'Complete todos los campos requeridos en cada registro', type: 'error' });
        setIsLoading(false);
        return;
      }

      const formattedData = registros.map(registro => ({
        sku: registro.sku,
        valor: registro.valor,
        desviacion: registro.desviacion,
        area: registro.area,
        unidad: registro.unidad,
        receptor: registro.receptor,
        observaciones: registro.observaciones || '',
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
      
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Carga Masiva de Registros</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
            {/* Datos comunes */}
            <Grid item xs={12}>
              <Typography variant="h6">Datos Comunes</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Tipo de Notificación</Typography>
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
              <Typography variant="subtitle2">Sentido</Typography>
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
                  onChange={(e) => handleBaseDataChange('canal_comunicacion', e.target.value)}
                  label="Canal de Comunicación"
                >
                  {['Correo', 'Microsoft Teams', 'Presencial', 'Radio', 'Teléfono Fijo', 'WhatsApp'].map((option) => (
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
                  onChange={(e) => handleBaseDataChange('indicador', e.target.value)}
                  label="Indicador"
                >
                  <MenuItem value="Cubicaje">Cubicaje</MenuItem>
                  <MenuItem value="Give Away">Give Away</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Campos de entrada de datos */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>Datos a Cargar</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>SKUs</Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={rawSkus}
                onChange={(e) => {
                  setRawSkus(e.target.value);
                  parseData(e.target.value, rawValues);
                }}
                placeholder={`Ejemplo:
1021731
1022748
1023373`}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>Valores y Desviaciones</Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={rawValues}
                onChange={(e) => {
                  setRawValues(e.target.value);
                  parseData(rawSkus, e.target.value);
                }}
                placeholder={`Ejemplo:
2,23% D3
1,62% D3
2,50% D3`}
              />
            </Grid>

            {/* Registros generados */}
            {registros.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Registros Detectados: {registros.length}
                  </Typography>
                </Grid>

                {registros.map((registro, index) => (
                  <Grid container item spacing={2} key={index}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Registro {index + 1}</Typography>
                    </Grid>
                    
                    {/* SKU (read-only) */}
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="SKU"
                        value={registro.sku}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>

                    {/* Valor (read-only) */}
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Valor Desviación"
                        value={registro.valor}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>

                    {/* Desviación (read-only) */}
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Desviación"
                        value={registro.desviacion}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>

                    {/* Área (editable) */}
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Área</InputLabel>
                        <Select
                          value={registro.area}
                          onChange={(e) => handleRegistroChange(index, 'area', e.target.value)}
                          label="Área"
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
                          value={registro.unidad}
                          onChange={(e) => handleRegistroChange(index, 'unidad', e.target.value)}
                          label="Subárea"
                          disabled={!registro.area}
                        >
                          {registro.area && areaUnidades[registro.area]?.map((unidad) => (
                            <MenuItem key={unidad} value={unidad}>{unidad}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Receptor"
                        value={registro.receptor}
                        onChange={(e) => handleRegistroChange(index, 'receptor', e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => {
                                  navigator.clipboard.writeText(registro.receptor);
                                }}
                              >
                                <ContentCopyIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Observaciones"
                        value={registro.observaciones}
                        onChange={(e) => handleRegistroChange(index, 'observaciones', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeRegistro(index)}
                        disabled={registros.length === 1}
                      >
                        Eliminar
                      </Button>
                    </Grid>
                  </Grid>
                ))}
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

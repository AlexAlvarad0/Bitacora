import React, { useState } from 'react';
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
    Typography 
} from '@mui/material';

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
        hora_desviacion: '00:00',
        respuesta: '',
        sku: '',
        producto: '',
        receptor: '',
        observaciones: ''
    });

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No estás autenticado. Por favor, inicia sesión.');
            navigate('/');
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
            alert('Formulario enviado exitosamente');
        } catch (error) {
            console.error('Error enviando formulario', error);
            if (error.response && error.response.status === 401) {
                alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                localStorage.removeItem('token');
                navigate('/');
            }
        }
    };

    const handleFieldChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const formatValue = (field, value) => {
        if (field === 'valor') {
            return `${value} %`;
        }
        return value;
    };

    return (
        <Box className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-lg">
            <Typography variant="h4" className="text-blue-700 mb-6">Formulario de Registro</Typography>
            <Box className="grid grid-cols-3 gap-6">
                <Box>
                    <Typography className="font-bold mb-2">Tipo de Notificación:</Typography>
                    <Box className="flex gap-2">
                        {['Alerta', 'Aviso', 'Información'].map((option) => (
                            <Button
                                key={option}
                                variant={formData.tipo_notificacion === option ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => handleFieldChange('tipo_notificacion', option)}
                                className="flex-1"
                            >
                                {option}
                            </Button>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Typography className="font-bold mb-2">Sentido:</Typography>
                    <Box className="flex gap-2">
                        {['Envío', 'Recepción'].map((option) => (
                            <Button
                                key={option}
                                variant={formData.sentido === option ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => handleFieldChange('sentido', option)}
                                className="flex-1"
                            >
                                {option}
                            </Button>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Typography className="font-bold mb-2">Desviación:</Typography>
                    <Box className="flex gap-2">
                        {['D1', 'D2', 'D3', 'D4'].map((option) => (
                            <Button
                                key={option}
                                variant={formData.desviacion === option ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => handleFieldChange('desviacion', option)}
                                className="flex-1"
                            >
                                {option}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box className="grid grid-cols-3 gap-6 mt-6">
                <FormControl>
                    <InputLabel>Canal de Comunicación</InputLabel>
                    <Select
                        value={formData.canal_comunicacion}
                        onChange={(e) => handleFieldChange('canal_comunicacion', e.target.value)}
                    >
                        <MenuItem value="">Seleccionar...</MenuItem>
                        {['Correo', 'Presencial', 'Radio', 'Teléfono Fijo', 'WhatsApp'].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel>Área</InputLabel>
                    <Select
                        value={formData.area}
                        onChange={(e) => handleFieldChange('area', e.target.value)}
                    >
                        <MenuItem value="">Seleccionar...</MenuItem>
                        {['Abastecimiento', 'Administración', 'Calidad', 'Congelado', 'Control de Producción', 'Cortes Especiales', 'Despacho', 'Desposte', 'Faena', 'General', 'Mantenimiento', 'Personas', 'Producción', 'Producción Animal', 'Servicios', 'Torre de Control'].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel>Unidad</InputLabel>
                    <Select
                        value={formData.unidad}
                        onChange={(e) => handleFieldChange('unidad', e.target.value)}
                        disabled={!formData.area || formData.area === 'Seleccionar...'}
                    >
                        <MenuItem value="">Seleccionar...</MenuItem>
                        {formData.area && formData.area !== 'Seleccionar...' && ['Armado de Cajas', 'Bodega'].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box className="grid grid-cols-3 gap-6 mt-6">
                <TextField
                    label="Indicador"
                    value={formData.indicador}
                    onChange={(e) => handleFieldChange('indicador', e.target.value)}
                />
                <TextField
                    label="Valor %"
                    value={formatValue('valor', formData.valor)}
                    onChange={(e) => handleFieldChange('valor', e.target.value)}
                />
                <FormControl>
                    <InputLabel>Hora de Desviación</InputLabel>
                    <Select
                        value={formData.hora_desviacion}
                        onChange={(e) => handleFieldChange('hora_desviacion', e.target.value)}
                    >
                        {['00:00', '00:05', '00:10', '00:15', '00:20', '00:25', '00:30', '00:35', '00:40', '00:45', '00:50', '00:55'].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box className="grid grid-cols-3 gap-6 mt-6">
                <Box>
                    <Typography className="font-bold mb-2">Respuesta:</Typography>
                    <Box className="flex gap-2">
                        {['Sí', 'No'].map((option) => (
                            <Button
                                key={option}
                                variant={formData.respuesta === option ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => handleFieldChange('respuesta', option)}
                                className="flex-1"
                            >
                                {option}
                            </Button>
                        ))}
                    </Box>
                </Box>
                <FormControl>
                    <InputLabel>SKU</InputLabel>
                    <Select
                        value={formData.sku}
                        onChange={(e) => {
                            const [sku, producto] = e.target.value.split(' - ');
                            handleFieldChange('sku', sku);
                            handleFieldChange('producto', producto);
                        }}
                    >
                        <MenuItem value="">Seleccionar...</MenuItem>
                        {['123 - Carne', '456 - Pollo', '789 - Cerdo'].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Receptor"
                    value={formData.receptor}
                    onChange={(e) => handleFieldChange('receptor', e.target.value)}
                />
            </Box>
            <Box className="grid grid-cols-1 gap-6 mt-6">
                <TextField
                    label="Observaciones"
                    multiline
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) => handleFieldChange('observaciones', e.target.value)}
                />
            </Box>
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className="mt-6 w-full"
            >
                Guardar Registro
            </Button>
        </Box>
    );
};

export default Formulario;
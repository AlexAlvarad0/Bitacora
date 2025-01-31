import React, { useState } from 'react';
import axios from 'axios';

const CrearMensaje = () => {
    const [texto, setTexto] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/mensajes/', { texto });
            alert('Mensaje creado exitosamente');
            setTexto('');
        } catch (error) {
            console.error('Error creando mensaje', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe un mensaje"
            />
            <button type="submit">Crear Mensaje</button>
        </form>
    );
};

export default CrearMensaje;
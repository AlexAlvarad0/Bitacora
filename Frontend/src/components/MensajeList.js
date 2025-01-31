import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MensajeList = () => {
    const [mensajes, setMensajes] = useState([]);

    useEffect(() => {
        const fetchMensajes = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/mensajes/');
                setMensajes(response.data);  // Asegúrate de que response.data sea un array
            } catch (error) {
                console.error('Error fetching mensajes', error);
            }
        };

        fetchMensajes();
    }, []);

    return (
        <div>
            <h1>Mensajes desde el Backend</h1>
            <ul>
                {mensajes.map((mensaje) => (
                    <li key={mensaje.id}>{mensaje.texto}</li>
                ))}
            </ul>
        </div>
    );
};

export default MensajeList;
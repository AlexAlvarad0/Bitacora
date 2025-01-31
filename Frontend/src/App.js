import React from 'react';
import MensajeList from './components/MensajeList';
import CrearMensaje from './components/CrearMensaje';

function App() {
    return (
        <div>
            <h1>Registro de Bitácora</h1>
            <CrearMensaje />
            <MensajeList />
        </div>
    );
}

export default App;
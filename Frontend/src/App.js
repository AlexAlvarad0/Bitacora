import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Formulario from './components/Formulario';
import Analisis from './components/Analisis'
import CargaMasiva from './components/CargaMasiva';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/formulario" element={<Formulario />} />  
                <Route path="/analisis" element={<Analisis />} />
                <Route path="/carga-masiva" element={<CargaMasiva />} />
            </Routes>
        </Router>
    );
};

export default App;
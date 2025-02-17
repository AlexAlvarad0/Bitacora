import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Formulario from './components/Formulario';
import BitacoraDashboard from './components/BitacoraDashboard'
import CargaMasiva from './components/CargaMasiva';
import TablaRegistros from './components/TablaRegistros';
import { ProSidebarProvider } from 'react-pro-sidebar';

const App = () => {
    return (
        <ProSidebarProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/formulario" element={<Formulario />} />  
                    <Route path="/analisis" element={<BitacoraDashboard />} />
                    <Route path="/tabla" element={<TablaRegistros />} />
                    <Route path="/carga-masiva" element={<CargaMasiva />} />
                </Routes>
            </Router>
        </ProSidebarProvider>
    );
};

export default App;
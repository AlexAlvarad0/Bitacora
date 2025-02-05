import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Formulario from './components/Formulario';
import Analisis from './components/Analisis'
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/formulario" element={<Formulario />} />  
                <Route path="/analisis" element={<Analisis />} />  
            </Routes>
        </Router>
    );
};

export default App;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './pages/Login';
import Formulario from './components/Formulario';
import BitacoraDashboard from './components/BitacoraDashboard';
import CargaMasiva from './components/CargaMasiva';
import TablaRegistros from './components/TablaRegistros';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003087',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default App;

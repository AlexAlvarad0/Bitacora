import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Pagination
} from '@mui/material';
import Layout from './Layout';

const TablaRegistros = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0); // Agregar este estado

  const columns = [
    {
      header: 'Fecha y Hora',
      accessorKey: 'Fecha y Hora',
      sortingFn: 'datetime'
    },
    {
      header: 'Tipo Notificación',
      accessorKey: 'Tipo Notificación',
    },
    {
      header: 'Sentido',
      accessorKey: 'Sentido',
    },
    {
      header: 'Canal',
      accessorKey: 'Canal de Comunicación',
    },
    {
      header: 'Emisor',
      accessorKey: 'Emisor',
    },
    {
      header: 'Área',
      accessorKey: 'Área',
    },
    {
      header: 'Unidad',
      accessorKey: 'Unidad',
    },
    {
      header: 'Indicador',
      accessorKey: 'Indicador',
    },
    {
      header: 'Valor %',
      accessorKey: 'Valor %',
    },
    {
      header: 'Desviación',
      accessorKey: 'Desviación',
      cell: ({ getValue }) => (
        <div
          style={{
            backgroundColor: 
              getValue() === 'D1' ? '#C6EFCE' :
              getValue() === 'D2' ? '#FDE208' :
              getValue() === 'D3' ? '#FFA500' :
              getValue() === 'D4' ? '#FF0000' : 
              'transparent',
            padding: '6px 16px',
            borderRadius: '16px',
            color: getValue() === 'D1' || getValue() === 'D2' ? 'black' : 'black',
            width: '80%',
            textAlign: 'center'
          }}
        >
          {getValue()}
        </div>
      ),
    },
    {
      header: 'Hora Desv.',
      accessorKey: 'Hora de Desviación',
    },
    {
      header: 'Respuesta',
      accessorKey: 'Respuesta',
    },
    {
      header: 'SKU',
      accessorKey: 'SKU',
    },
    {
      header: 'Producto',
      accessorKey: 'Producto',
    },
    {
      header: 'Receptor',
      accessorKey: 'Receptor',
    },
    {
      header: 'Observaciones',
      accessorKey: 'Observaciones',
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageSize, pageIndex });
        setPageSize(newState.pageSize);
        setPageIndex(newState.pageIndex);
      } else {
        setPageSize(updater.pageSize);
        setPageIndex(updater.pageIndex);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/excel-data/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const sortedData = response.data.data.sort((a, b) => {
            const parseDate = (dateStr) => {
              if (!dateStr) return new Date(0); // Fecha mínima para valores vacíos
              const [day, month, yearAndTime] = dateStr.split('-');
              const [year, time] = yearAndTime.split(' ');
              return new Date(`${year}-${month}-${day}T${time}`);
            };
          
            const dateA = parseDate(a['Fecha y Hora']);
            const dateB = parseDate(b['Fecha y Hora']);
            return dateB - dateA; // Orden descendente
          });
          setData(sortedData);
        } else {
          console.error('Formato de datos inesperado:', response.data);
          setError('Error en el formato de datos recibidos');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper sx={{ p: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: 'Gotham-Bold, sans-serif',
            color: '#003087',
            mb: 3
          }}
        >
          Registros de Bitácora
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filas por página</InputLabel>
            <Select
              value={pageSize}
              label="Filas por página"
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        background: '#f5f5f5',
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '2px solid #ddd',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #ddd' }}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="flex-end" 
          alignItems="center" 
          sx={{ mt: 2 }}
        >
          <Typography variant="body2">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </Typography>
          <Pagination
            count={table.getPageCount()}
            page={pageIndex + 1}
            onChange={(event, newPage) => {
              setPageIndex(newPage - 1);
            }}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>
    </Layout>
  );
};

export default TablaRegistros;
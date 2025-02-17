import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import Layout from './Layout';

const TablaRegistros = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize sorting to sort by 'Fecha y Hora' in descending order
  const [sorting, setSorting] = useState([
    { id: 'Fecha y Hora', desc: true }
  ]);

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
              getValue() === 'D2' ? '#FFFF00' :
              getValue() === 'D3' ? '#FFA500' :
              getValue() === 'D4' ? '#FF0000' : 
              'transparent',
            padding: '6px 16px',
            borderRadius: '16px',
            color: getValue() === 'D1' || getValue() === 'D2' ? 'black' : 'white',
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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
          setData(response.data.data);
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
                        cursor: header.column.getCanSort() ? 'pointer' : 'default'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
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

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              variant="contained"
              sx={{ mr: 1 }}
            >
              {'<<'}
            </Button>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="contained"
              sx={{ mr: 1 }}
            >
              {'<'}
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="contained"
              sx={{ mr: 1 }}
            >
              {'>'}
            </Button>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              variant="contained"
            >
              {'>>'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </Typography>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
              style={{ padding: '4px' }}
            >
              {[10, 25, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Mostrar {pageSize}
                </option>
              ))}
            </select>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
};

export default TablaRegistros;
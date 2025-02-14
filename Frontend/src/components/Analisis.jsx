import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from 'axios';
import moment from 'moment';

const Analisis = () => {
    const [bitacoraData, setBitacoraData] = useState([]);
    const [dateRange, setDateRange] = useState([
        {
            startDate: addDays(new Date(), -7),  // Initialize to last 7 days
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/bitacora/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBitacoraData(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = bitacoraData.filter(item => {
        const itemDate = moment(item['Fecha y Hora'], 'DD-MM-YYYY HH:mm:ss');
        return itemDate.isBetween(
            moment(dateRange[0].startDate).startOf('day'),
            moment(dateRange[0].endDate).endOf('day'),
            'day',
            '[]'
        );
    });

    const getDeviationCountsByDay = () => {
        const counts = {};
        filteredData.forEach(item => {
            const date = item['Fecha y Hora'].split(' ')[0];
            if (!counts[date]) {
                counts[date] = { D1: 0, D2: 0, D3: 0, D4: 0 };
            }
            counts[date][item.Desviación]++;
        });
        return counts;
    };

    const getDeviationCountsByArea = () => {
        const counts = {};
        filteredData.forEach(item => {
            if (!counts[item.Área]) {
                counts[item.Área] = 0;
            }
            counts[item.Área]++;
        });
        return counts;
    };

    const prepareBarChartData = () => {
        const data = [];
        Object.entries(getDeviationCountsByDay()).forEach(([date, counts]) => {
            data.push({
                fecha: date,
                D1: counts.D1,
                D2: counts.D2,
                D3: counts.D3,
                D4: counts.D4
            });
        });
        return data;
    };

    const preparePieChartData = () => {
        return Object.entries(getDeviationCountsByArea()).map(([area, count]) => ({
            name: area,
            value: count
        }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-6">Análisis de Desviaciones</h1>
            
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Seleccione el rango de fechas</h2>
                <DateRangePicker
                    onChange={item => setDateRange([item.selection])}
                    ranges={dateRange}
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Desviaciones por Día</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={prepareBarChartData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="fecha" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="D1" fill="#C6EFCE" name="D1" />
                                <Bar dataKey="D2" fill="#FFEB9C" name="D2" />
                                <Bar dataKey="D3" fill="#FFA500" name="D3" />
                                <Bar dataKey="D4" fill="#FF0000" name="D4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Desviaciones por Área</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={preparePieChartData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {preparePieChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analisis;

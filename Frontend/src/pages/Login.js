import axios from 'axios';

const handleLogin = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
        localStorage.setItem('token', response.data.token);
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Error logging in', error);
    }
};
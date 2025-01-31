import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', { username, password });
      localStorage.setItem('token', response.data.access);
      navigate('/formulario');
    } catch (error) {
      console.error('Error logging in', error);
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <p>Please enter your Login and your Password</p>
      <div className="input-group">
        <input
          type="text"
          placeholder="Username or E-mail"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
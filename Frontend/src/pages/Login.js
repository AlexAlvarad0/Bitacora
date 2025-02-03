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
      <div className="login-card">
        <div className="login-form">
          <div className="title-section">
            <h1>Sign In</h1>
            <div className="social-icons">
              <div className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="social-icon">
                <i className="fab fa-twitter"></i>
              </div>
            </div>
          </div>
          
          <div className="input-group">
            <label>USERNAME</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button className="login-button" onClick={handleLogin}>
            Sign In
          </button>
          
          <div className="options-row">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password</a>
          </div>
        </div>
        
        <div className="welcome-side">
          <h2>Welcome to login</h2>
          <p>Don't have an account?</p>
          <button className="signup-button">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
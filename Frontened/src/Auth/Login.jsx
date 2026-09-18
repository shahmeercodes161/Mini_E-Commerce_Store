import React, { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, LogIn } from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Stores server error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset errors before trying to connect
    
    try {
      // 🟢 Connecting directly to your backend on port 3000
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'GET', // Testing connection by fetching products
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Backend connection successful!');
        if (onLoginSuccess) {
          onLoginSuccess(); // Log the user in if the backend responds smoothly
        }
      } else {
        setErrorMessage('Backend found, but returned an error response.');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setErrorMessage('Cannot connect to backend. Is your server running on port 3000?');
    }
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in</p>
        </div>

        {/* Displays the server connection status if it fails */}
        {errorMessage && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #fee2e2' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Inputfield
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            icon={<Mail size={18} />}
          />

          <Inputfield
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={18} />}
          />

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="submit-btn">
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div className="form-options" style={{ marginTop: '1rem', justifyContent: 'center', display: 'flex' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <span 
              onClick={onSwitchToSignup} 
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign Up
            </span>
          </p>
        </div>

        <Sociallogin />
      </div>
    </div>
  );
}
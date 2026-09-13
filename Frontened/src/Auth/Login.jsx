
import React, { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, LogIn } from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = existingUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser || existingUsers.length === 0) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      alert('Invalid email or password. Please check your details or sign up.');
    }
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in</p>
        </div>

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
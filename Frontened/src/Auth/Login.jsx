import { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import './Login.css';

export default function Login({ initialEmail = '', onLoginSuccess, onSwitchToSignup, onSwitchToAdminLogin }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Look for customer or existing user
    const foundUser = existingUsers.find(
      (user) => user.email.toLowerCase() === trimmedEmail && user.password === password
    );

    // If user typed admin credentials here, redirect or log in as admin
    if (trimmedEmail === 'admin@doorstep.com' && password === 'admin123') {
      const adminUser = { name: 'Master Admin', email: 'admin@doorstep.com', role: 'admin' };
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      if (onLoginSuccess) onLoginSuccess(adminUser);
      return;
    }

    if (foundUser) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      if (onLoginSuccess) {
        onLoginSuccess(foundUser);
      }
    } else {
      setErrorMessage('Invalid customer credentials. Please check your email/password or create an account.');
    }
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Customer Sign In</h2>
          <p>Sign in to your Doorstep shopping account</p>
        </div>

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
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="submit-btn">
            <LogIn size={18} /> Sign In & Start Shopping
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

        {/* SEPARATE ADMIN PORTAL ENTRY */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onSwitchToAdminLogin}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#eff6ff';
              e.currentTarget.style.borderColor = '#93c5fd';
              e.currentTarget.style.color = '#1d4ed8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#334155';
            }}
          >
            <ShieldAlert size={16} color="#2563eb" /> Store Manager / Admin Portal →
          </button>
        </div>
      </div>
    </div>
  );
}
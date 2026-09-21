import { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import { Mail, Lock, ShieldCheck, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './Login.css';

export default function AdminLogin({ onAdminLoginSuccess, onSwitchToCustomerLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      let adminUser = null;

      // 1. Authenticate with backend API
      if (API_BASE_URL) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail, password })
          });

          const data = await res.json();
          if (res.ok && data.user && data.user.role === 'admin') {
            adminUser = data.user;
          }
        } catch (apiErr) {
          console.warn('Backend connection notice during admin login:', apiErr);
        }
      }

      // 2. Fallback check for built-in admin or local admin backup
      if (!adminUser) {
        const isDefaultAdmin = (trimmedEmail === 'admin@doorstep.com' && password === 'admin123');
        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
        const matchedAdmin = existingUsers.find(
          (u) => u.email.toLowerCase() === trimmedEmail && u.password === password && u.role === 'admin'
        );

        if (isDefaultAdmin || matchedAdmin) {
          adminUser = matchedAdmin || {
            name: 'Master Admin',
            email: 'admin@doorstep.com',
            role: 'admin'
          };
        }
      }

      if (adminUser) {
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(adminUser);
        }
      } else {
        setErrorMessage('Invalid admin credentials. Use admin@doorstep.com / admin123 or check your permissions.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setEmail('admin@doorstep.com');
    setPassword('admin123');
  };

  return (
    <div className="auth-container" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="login-card" style={{ border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <div className="login-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: '#eff6ff', borderRadius: '50%', marginBottom: '12px', color: '#2563eb' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0f172a' }}>Admin Portal Login</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Access store inventory, product manager & customer orders</p>
        </div>

        {errorMessage && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', textAlign: 'center', border: '1px solid #fee2e2' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Inputfield
            label="Admin Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@doorstep.com"
            icon={<Mail size={18} />}
          />

          <Inputfield
            label="Security Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={18} />}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleQuickAdmin}
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.8rem',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '600'
              }}
            >
              <Sparkles size={14} /> Quick Admin Fill
            </button>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Default: admin123</span>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
            style={{ 
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              marginTop: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.75 : 1
            }}
          >
            <KeyRound size={18} /> {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onSwitchToCustomerLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
          >
            <ArrowLeft size={16} /> Return to Customer Store Login
          </button>
        </div>
      </div>
    </div>
  );
}

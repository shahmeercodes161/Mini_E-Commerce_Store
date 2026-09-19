import { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, User, UserPlus, CheckCircle2, ArrowRight, ShoppingBag, X } from 'lucide-react';
import './Login.css';

export default function Signupform({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const handleSignup = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    if (existingUsers.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setErrorMessage('An account with this email address already exists. Please sign in.');
      return;
    }

    // Create new user object
    const newUser = { name: name.trim(), email: trimmedEmail, password, role: 'customer' };

    // Save user in users catalog
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    // Persist as current active user
    try {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    setCreatedUser(newUser);
    setShowSuccessModal(true);
  };

  const handleDirectShop = () => {
    setShowSuccessModal(false);
    if (onSignupSuccess && createdUser) {
      onSignupSuccess(createdUser);
    } else if (onSwitchToLogin) {
      onSwitchToLogin(createdUser?.email || email.trim());
    }
  };

  const handleGoToSignIn = () => {
    setShowSuccessModal(false);
    if (onSwitchToLogin) {
      onSwitchToLogin(createdUser?.email || email.trim());
    }
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Create Account</h2>
          <p>Sign up to start shopping on Doorstep</p>
        </div>

        {errorMessage && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', border: '1px solid #fee2e2' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="login-form">
          <Inputfield
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Muhammad Shahmir"
            icon={<User size={18} />}
          />

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

          <button type="submit" className="submit-btn" style={{ cursor: 'pointer' }}>
            <UserPlus size={18} /> Sign Up
          </button>
        </form>

        <div className="form-options" style={{ marginTop: '1.2rem', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Already have an account?{' '}
            <span 
              onClick={() => onSwitchToLogin && onSwitchToLogin(email.trim())} 
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '700' }}
            >
              Sign In
            </span>
          </p>
        </div>

        <Sociallogin />
      </div>

      {/* POPUP MODAL MESSAGE UPON ACCOUNT CREATION */}
      {showSuccessModal && (
        <div className="modal-backdrop" onClick={handleDirectShop}>
          <div 
            className="modal-dialog" 
            style={{ position: 'relative' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleDirectShop}
              aria-label="Close popup"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>

            <div className="modal-icon">
              <CheckCircle2 size={44} color="#10b981" />
            </div>

            <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '8px' }}>
              Account Created Successfully! 🎉
            </h3>
            
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 1.2rem 0' }}>
              Welcome, <strong>{createdUser?.name}</strong>! Your Doorstep shopping profile is registered. You can jump straight into the store or sign in anytime.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={handleDirectShop}
                className="submit-btn"
                style={{ width: '100%', gap: '8px', fontSize: '1rem', cursor: 'pointer', margin: 0 }}
              >
                <ShoppingBag size={18} /> Start Shopping Now
              </button>

              <button
                type="button"
                onClick={handleGoToSignIn}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
              >
                Proceed to Sign In <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
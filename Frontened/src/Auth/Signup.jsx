import { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, User, UserPlus, CheckCircle2, ArrowRight } from 'lucide-react';
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
    
    const trimmedEmail = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    if (existingUsers.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setErrorMessage('An account with this email address already exists. Please sign in.');
      return;
    }

    // Create new user object
    const newUser = { name: name.trim(), email: trimmedEmail, password, role: 'customer' };

    // Save user
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    // Show in-app modal popup instead of browser alert
    setCreatedUser(newUser);
    setShowSuccessModal(true);
  };

  const handleProceedToLogin = () => {
    setShowSuccessModal(false);
    if (onSignupSuccess && createdUser) {
      onSignupSuccess(createdUser);
    } else if (onSwitchToLogin) {
      onSwitchToLogin();
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

          <button type="submit" className="submit-btn">
            <UserPlus size={18} /> Sign Up
          </button>
        </form>

        <div className="form-options" style={{ marginTop: '1.2rem', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Already have an account?{' '}
            <span 
              onClick={onSwitchToLogin} 
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
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-icon">
              <CheckCircle2 size={44} color="#10b981" />
            </div>
            <h3>Account Created Successfully! 🎉</h3>
            <p>
              Welcome, <strong>{createdUser?.name}</strong>! Your Doorstep shopping profile has been registered. Sign in now to start shopping.
            </p>
            <button
              type="button"
              onClick={handleProceedToLogin}
              className="submit-btn"
              style={{ width: '100%', gap: '8px', fontSize: '1rem' }}
            >
              Proceed to Sign In <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
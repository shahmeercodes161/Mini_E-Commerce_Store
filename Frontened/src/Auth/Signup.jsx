import { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './Login.css';

export default function Signupform({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      let registeredUser = null;

      // 1. Send registration to Backend / Database
      if (API_BASE_URL) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              email: trimmedEmail,
              password
            })
          });

          const data = await res.json();

          if (!res.ok) {
            setErrorMessage(data.message || 'Registration failed. Please check your information.');
            setIsSubmitting(false);
            return;
          }

          registeredUser = data.user;
        } catch (apiErr) {
          console.warn('Backend API connection notice, falling back locally:', apiErr);
        }
      }

      // 2. Prepare user object
      const newUser = registeredUser || { 
        _id: 'local-' + Date.now(), 
        name: name.trim(), 
        email: trimmedEmail, 
        password, 
        role: 'customer' 
      };

      // 3. Update local backup
      const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
      if (!existingUsers.some(u => u.email.toLowerCase() === trimmedEmail)) {
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
      }

      try {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // 4. Authenticate directly
      if (onSignupSuccess) {
        onSignupSuccess(newUser);
      } else if (onSwitchToLogin) {
        onSwitchToLogin(newUser.email);
      }
    } finally {
      setIsSubmitting(false);
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

          <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.75 : 1 }}>
            <UserPlus size={18} /> {isSubmitting ? 'Creating Account...' : 'Sign Up'}
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
    </div>
  );
}
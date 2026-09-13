import React, { useState } from 'react';
import Inputfield from '../Components/Inputfield';
import Sociallogin from '../Components/Sociallogin';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export default function Signupform({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    
    // Create new user object
    const newUser = { name, email, password };

    // Get existing users from localStorage or start an empty array
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Push new user into array and save back
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    alert('Account created successfully! Please sign in.');
    
    // Switch back to login page
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Create Account</h2>
          <p>Sign up to start shopping</p>
        </div>

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

        <div className="form-options" style={{ marginTop: '1rem', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Already have an account?{' '}
            <span 
              onClick={onSwitchToLogin} 
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
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
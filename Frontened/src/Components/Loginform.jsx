import React, { useState } from 'react';
import InputField from './Inputfield';
import SocialLogin from './Sociallogin';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logging in with: ${email}`);
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Please enter your details to sign in</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          icon={<Mail size={18} />}
        />

        <InputField
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

      <SocialLogin />
    </div>
  );
}
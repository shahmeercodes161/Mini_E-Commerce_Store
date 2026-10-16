import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Inputfield.css';

export default function InputField({ label, type = 'text', value, onChange, placeholder, icon, required = true }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className={`input-wrapper ${icon ? 'has-icon' : ''} ${isPassword ? 'has-toggle' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={isPassword ? 'current-password' : (type === 'email' ? 'email' : 'on')}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
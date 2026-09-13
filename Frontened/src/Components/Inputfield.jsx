import React from 'react';

export default function InputField({ label, type, value, onChange, placeholder, icon }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  );
}
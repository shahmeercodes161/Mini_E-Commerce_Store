import React from 'react';

export default function SocialLogin() {
  return (
    <div className="social-login">
      <p className="divider"><span>Or continue with</span></p>
      <div className="social-buttons">
        <button type="button" className="social-btn" onClick={() => alert("Google Login clicked")}>
          Google
        </button>
        <button type="button" className="social-btn" onClick={() => alert("GitHub Login clicked")}>
          GitHub
        </button>
      </div>
    </div>
  );
}
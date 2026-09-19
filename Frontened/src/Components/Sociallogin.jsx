import { useState } from 'react';

export default function SocialLogin() {
  const [socialNotice, setSocialNotice] = useState('');

  const handleSocialClick = (provider) => {
    setSocialNotice(`${provider} single sign-on simulated for demo mode.`);
    setTimeout(() => setSocialNotice(''), 3000);
  };

  return (
    <div className="social-login">
      <p className="divider"><span>Or continue with</span></p>

      {socialNotice && (
        <div style={{ fontSize: '12px', color: '#2563eb', background: '#eff6ff', padding: '6px 10px', borderRadius: '6px', textAlign: 'center', marginBottom: '10px' }}>
          {socialNotice}
        </div>
      )}

      <div className="social-buttons">
        <button type="button" className="social-btn" onClick={() => handleSocialClick('Google')}>
          Google
        </button>
        <button type="button" className="social-btn" onClick={() => handleSocialClick('GitHub')}>
          GitHub
        </button>
      </div>
    </div>
  );
}
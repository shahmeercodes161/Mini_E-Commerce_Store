import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export default function Contact() {
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setContactData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="static-page" style={{ padding: '2.5rem 1.5rem', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>Contact Us</h2>
      <p style={{ marginTop: '0.4rem', color: '#64748b', marginBottom: '1.8rem' }}>Have questions or suggestions? Reach out to our customer support team.</p>

      {submitted && (
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600' }}>
          <CheckCircle2 size={24} color="#059669" />
          <div>
            <div style={{ fontSize: '15px' }}>Message Sent Successfully!</div>
            <div style={{ fontSize: '13px', fontWeight: '400', color: '#065f46' }}>Thank you for reaching out. We will review your message and reply via email shortly.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Your Name *</label>
          <input 
            type="text" 
            required 
            value={contactData.name}
            onChange={(e) => setContactData({...contactData, name: e.target.value})}
            placeholder="Type Your Full Name Here" 
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Your Email Address *</label>
          <input 
            type="email" 
            required 
            value={contactData.email}
            onChange={(e) => setContactData({...contactData, email: e.target.value})}
            placeholder="name@example.com" 
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Message *</label>
          <textarea 
            rows="4" 
            required 
            value={contactData.message}
            onChange={(e) => setContactData({...contactData, message: e.target.value})}
            placeholder="How can we help you today?" 
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          style={{ background: '#2563eb', color: 'white', padding: '0.85rem', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Send size={16} /> Send Message
        </button>
      </form>
    </div>
  );
}
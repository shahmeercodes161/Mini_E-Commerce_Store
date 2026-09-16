import React, { useState } from 'react';

export default function Contact() {
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setContactData({ name: '', email: '', message: '' });
  };

  return (
    <div className="static-page" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Contact Us</h2>
      <p style={{ marginTop: '0.5rem', color: '#475569', marginBottom: '1.5rem' }}>Have questions? Reach out to our support team.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Your Name</label>
          <input 
            type="text" 
            required 
            value={contactData.name}
            onChange={(e) => setContactData({...contactData, name: e.target.value})}
            placeholder="Type Your Full Name Here" 
            style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
          />
        </div>
        <div className="form-group">
          <label>Your Email</label>
          <input 
            type="email" 
            required 
            value={contactData.email}
            onChange={(e) => setContactData({...contactData, email: e.target.value})}
            placeholder="name@example.com" 
            style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea 
            rows="4" 
            required 
            value={contactData.message}
            onChange={(e) => setContactData({...contactData, message: e.target.value})}
            placeholder="How can we help you?" 
            style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          ></textarea>
        </div>
        <button type="submit" className="submit-btn" style={{ background: '#2563eb', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Send Message</button>
      </form>
    </div>
  );
}
import { useState } from 'react';
import Login from './Auth/Login';
import AdminLogin from './Auth/AdminLogin';
import Signup from './Auth/Signup';
import Shop from './Pages/Landingpage';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('customer_login'); // 'customer_login', 'admin_login', 'signup'
  const [prefillEmail, setPrefillEmail] = useState('');

  const handleLoginSuccess = (user) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentView('customer_login');
  };

  if (currentUser) {
    const initialPage = currentUser.role === 'admin' ? 'admin' : 'shop';
    return (
      <Shop 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        initialPage={initialPage}
      />
    );
  }

  return (
    <div>
      {currentView === 'admin_login' ? (
        <AdminLogin
          onAdminLoginSuccess={handleLoginSuccess}
          onSwitchToCustomerLogin={() => setCurrentView('customer_login')}
        />
      ) : currentView === 'signup' ? (
        <Signup 
          onSignupSuccess={handleLoginSuccess}
          onSwitchToLogin={(email) => {
            if (email) setPrefillEmail(email);
            setCurrentView('customer_login');
          }} 
        />
      ) : (
        <Login 
          key={prefillEmail || 'default-login'}
          initialEmail={prefillEmail}
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToSignup={() => setCurrentView('signup')}
          onSwitchToAdminLogin={() => setCurrentView('admin_login')}
        />
      )}
    </div>
  );
}
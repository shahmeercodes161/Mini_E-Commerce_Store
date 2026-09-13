import React, { useState } from 'react';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Shop from './Pages/Landingpage';
import './App.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'

  if (isLoggedIn) {
    return <Shop />;
  }

  return (
    <div>
      {currentView === 'login' ? (
        <Login 
          onLoginSuccess={() => setIsLoggedIn(true)} 
          onSwitchToSignup={() => setCurrentView('signup')} 
        />
      ) : (
        <Signup 
          onSwitchToLogin={() => setCurrentView('login')} 
        />
      )}
    </div>
  );
}
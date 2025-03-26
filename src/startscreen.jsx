import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="start-screen">
      <div className="logo-placeholder">
        {/* Replace src with your real logo */}
        <img src="/placeholder-logo.png" alt="Swipetizer Logo" />
      </div>

      <div className="button-group">
        <button onClick={() => navigate('/register')}>Get Started</button>
        <button onClick={() => navigate('/login')}>Log In</button>
        <button onClick={() => navigate('/home')}>Join without an account</button>
      </div>
    </div>
  );
};

export default StartScreen;
// Main start page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="start-screen-wrapper">
      <div className="phone-frame">
        <div className="start-screen">
          <div className="logo-placeholder">
            <img src="/images/swipelogo.svg" alt="Swipetizer Logo" />
          </div>

          <div className="button-group">
            <button onClick={() => navigate('/register')}>Get Started</button>
            <button onClick={() => navigate('/login')}>Log In</button>
            <button
  onClick={() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    sessionStorage.clear();
    navigate('/session-choice');
  }}
>
  Join without an account
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const SessionChoice = () => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const trimmed = pin.trim();
    if (trimmed !== '') {
      navigate(`/waiting-room?code=${trimmed}`); // tricky freaking link needs the hyphen inbetween waiting and room
    }
  };

  return (
    <div className="session-choice-wrapper">
      <div className="session-choice-card">
        <h2>How do you want to start?</h2>

        <button
          className="session-button"
          onClick={() => setShowJoinInput((prev) => !prev)}
        >
          Join Session
        </button>

        <div className={`pin-dropdown ${showJoinInput ? 'open' : ''}`}>
          <input
            type="text"
            placeholder="PIN"
            className="pin-input"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button className="pin-join-btn" onClick={handleJoin}>
            Join
          </button>
        </div>

        <button
          className="session-button"
          onClick={() => navigate('/filter-page')}
        >
          Create Session
        </button>
      </div>
    </div>
  );
};

export default SessionChoice;

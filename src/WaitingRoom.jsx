import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionCode = queryParams.get('code') || 'DEMO123';

  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isCreator, setIsCreator] = useState(() => {
    const saved = sessionStorage.getItem("isCreator");
    return saved ? JSON.parse(saved) : true; // Assume creator by default
  });

  useEffect(() => {
    sessionStorage.setItem("isCreator", JSON.stringify(true));
    setIsCreator(true);

    // Fake participants: you + guest
    const fakeData = [
      { username: "You", isCreator: true },
      { username: "Guest", isCreator: false },
    ];
    setParticipants(fakeData);
  }, []);

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLaunchSession = () => {
    const preferences = location.state?.preferences || {};
    navigate(`/swipe?code=${sessionCode}`, {
      state: { preferences, isCreator: true }
    });
  };

  const handleLeaveSession = () => {
    navigate('/session-choice');
  };

  return (
    <div className="filter-page">
      <h1>Waiting Room</h1>

      <div className="session-code">
        <h3>SESSION CODE</h3>
        <div className="code-box">{sessionCode}</div>
        <button onClick={copySessionCode}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <div className="section">
        <div className="label">Participants ({participants.length})</div>
        <div className="participants-container">
          {participants.length === 0 ? (
            <p className="waiting-message">Waiting for your friends to join...</p>
          ) : (
            participants.map((p, i) => (
              <div key={i} className="participant-item">
                <span className="participant-name">
                  {p.username || `Guest ${i + 1}`}
                  {p.isCreator && <span className="creator-badge">Host</span>}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <hr />

      <div className="section">
        <p className="waiting-message">
          {isCreator
            ? "Waiting for your friends to join..."
            : "Waiting for host to start the session..."}
        </p>
      </div>

      {isCreator ? (
        <button
          className="create-session-btn launch-button"
          onClick={handleLaunchSession}
        >
          Launch Session
        </button>
      ) : (
        <button className="create-session-btn waiting-button" disabled>
          Waiting for Host...
        </button>
      )}

      <div className="button-margin-top">
        <button
          className="create-session-btn cancel-button"
          onClick={handleLeaveSession}
        >
          Leave Session
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;

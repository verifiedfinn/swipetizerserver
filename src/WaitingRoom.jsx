import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // adjust for prod

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionCode = queryParams.get('code') || '1234';

  const [isCreator, setIsCreator] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch session AND join socket room
  useEffect(() => {
    const joinSession = async () => {
      const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      const fallbackId = `guest-${socket.id}`;
      const fallbackUsername = `Guest ${Math.floor(Math.random() * 1000)}`;
      const userId = storedUserId || fallbackId;
      const username = storedUsername || fallbackUsername;
  
      try {
        const res = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}`);
        const hostId = res.data?.createdBy;
        const isHost = storedUserId && Number(storedUserId) === Number(hostId);
  
        setIsCreator(isHost);
        console.log("🟢 You are host:", isHost);
  
        socket.emit("joinRoom", {
          sessionCode,
          user: {
            id: userId,
            username,
            isCreator: isHost,
          },
        });
  
        const resP = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/participants`);
        setParticipants(Array.isArray(resP.data) ? resP.data : []);
        console.log("👥 Initial participants:", resP.data);
  
      } catch (err) {
        console.error("❌ Failed to join session:", err);
        setError("Failed to join session.");
        navigate("/session");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (socket.connected) {
      joinSession();
    } else {
      socket.on("connect", joinSession);
    }
  
    return () => {
      socket.emit("leave-session", sessionCode);
      socket.off("connect", joinSession);
    };
  }, [sessionCode, navigate]);

  // Listen for updates
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/participants`);
        console.log("👥 Participants received:", res.data);
        setParticipants(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Failed to fetch participants:", err);
      }
    };

    socket.on('participantUpdate', fetchParticipants);
    socket.on('sessionStarted', () => navigate('/swipe'));

    return () => {
      socket.emit('leave-session', sessionCode);
      socket.off('participantUpdate', fetchParticipants);
      socket.off('sessionStarted');
    };
  }, [sessionCode, navigate]);

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLaunchSession = async () => {
    try {
      await axios.post(`http://localhost:3001/api/sessions/${sessionCode}/launch`);
      socket.emit('startSession', sessionCode);
      navigate('/swipe');
    } catch {
      setError("Failed to launch session.");
    }
  };

  const handleLeaveSession = async () => {
    try {
      await axios.post(`http://localhost:3001/api/sessions/${sessionCode}/leave`);
    } finally {
      navigate('/session');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="loader"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="filter-page">
        <h1>Error</h1>
        <p className="error-message">{error}</p>
        <button className="create-session-btn" onClick={() => navigate('/session')}>
          Back to Session
        </button>
      </div>
    );
  }

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
                  {(!p.id || isNaN(Number(p.id))) && (
                    <span className="guest-badge">Guest</span>
                  )}
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
        <button className="create-session-btn launch-button" onClick={handleLaunchSession} disabled={participants.length < 2}>
          Launch Session
        </button>
      ) : (
        <button className="create-session-btn waiting-button" disabled>
          Waiting for Host...
        </button>
      )}

      <div className="button-margin-top">
        <button className="create-session-btn cancel-button" onClick={handleLeaveSession}>
          Leave Session
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;
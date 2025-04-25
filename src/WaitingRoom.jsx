import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import socket from './socket';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionCode = queryParams.get('code');

  const [isCreator, setIsCreator] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const hasJoinedRef = useRef(false);
  const preferences = location.state?.preferences || null;

  const getUser = () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const username = localStorage.getItem('username') || `Guest ${Math.floor(Math.random() * 1000)}`;
    const finalId = userId || (() => {
      const temp = `guest-${Math.floor(Math.random() * 100000)}`;
      localStorage.setItem('guestId', temp);
      return temp;
    })();
    return { id: finalId, username, isGuest: !userId };
  };

  useEffect(() => {
    if (!sessionCode) {
      setError("No session code provided.");
      navigate('/session-choice');
      return;
    }

    const joinSession = async () => {
      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;

      const { id: userId, username, isGuest } = getUser();

      try {
        const res = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}`);
        const hostId = res.data?.createdBy;
        const isHost = !isGuest && Number(userId) === Number(hostId);
        setIsCreator(isHost);

        socket.emit("joinRoom", {
          sessionCode,
          user: { id: userId, username, isCreator: isHost },
        });

        const resP = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/participants`);
        setParticipants(Array.isArray(resP.data) ? resP.data : []);
      } catch (err) {
        console.error("❌ Error joining session:", err);
        setError("Failed to join session.");
        navigate('/session-choice');
      } finally {
        setIsLoading(false);
      }
    };

    if (socket.connected) {
      joinSession();
    } else {
      socket.once('connect', joinSession);
      socket.connect();
    }

    return () => {
      socket.emit("leave-session", sessionCode);
      socket.off("connect", joinSession);
    };
  }, [sessionCode, navigate]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/participants`);
        setParticipants(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Could not update participants:", err);
      }
    };

    socket.on('participantUpdate', fetchParticipants);
    socket.on('sessionStarted', async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/preferences`);
        const prefsFromServer = res.data;
        navigate(`/swipe?code=${sessionCode}`, {
          state: { preferences: prefsFromServer }
        });
      } catch (err) {
        console.error("❌ Failed to load session preferences:", err);
        navigate(`/swipe?code=${sessionCode}`);
      }
    });

    return () => {
      socket.off('participantUpdate', fetchParticipants);
      socket.off('sessionStarted');
    };
  }, [sessionCode, navigate, preferences]);

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
      navigate(`/swipe?code=${sessionCode}`, { state: { preferences } });
    } catch {
      setError("Failed to launch session.");
    }
  };

  const handleLeaveSession = () => {
    navigate('/session-choice');
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
        <button className="create-session-btn" onClick={() => navigate('/session-choice')}>
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
        <button onClick={copySessionCode}>{copied ? 'Copied!' : 'Copy Code'}</button>
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
                  {String(p.id).startsWith("guest") && <span className="guest-badge">Guest</span>}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <hr />

      <div className="section">
        <p className="waiting-message">
          {isCreator ? "Waiting for your friends to join..." : "Waiting for host to start the session..."}
        </p>
      </div>

      {isCreator ? (
        <button
          className="create-session-btn launch-button"
          onClick={handleLaunchSession}
          disabled={participants.length < 2}
        >
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
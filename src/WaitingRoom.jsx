import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import socket from './socket';
import getUser from './utils/getUser';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionCode = queryParams.get('code');

  const [isCreator, setIsCreator] = useState(() => {
    const saved = sessionStorage.getItem("isCreator");
    return saved ? JSON.parse(saved) : false;
  });
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const hasJoinedRef = useRef(false);
  const preferences = location.state?.preferences || null;

  useEffect(() => {
    if (!sessionCode) {
      setError("No session code provided.");
      navigate('/session-choice');
      return;
    }

    // Join session functionality
  
    const joinSession = async () => {
      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;
  
      const { id: userId, isGuest } = getUser();
  
      try {
        const res = await axios.get(`/api/sessions/${sessionCode}`);
        const hostId = res.data?.createdBy;
        const creatorIdFromNav = location.state?.creatorId;
        const isHost = location.state?.isCreator || String(userId) === String(hostId) || String(userId) === String(creatorIdFromNav);
        setIsCreator(isHost);
        sessionStorage.setItem("isCreator", JSON.stringify(isHost));
  
        // Ensure the socket is connected before emitting the joinRoom event
        if (socket.connected) {
          socket.emit("joinRoom", {
            sessionCode,
            user: {
              id: userId,
              isGuest,
              isCreator: isHost,
            },
          });
        } else {
          socket.once('connect', () => {
            socket.emit("joinRoom", {
              sessionCode,
              user: {
                id: userId,
                isGuest,
                isCreator: isHost,
              },
            });
          });
          socket.connect();
        }
  
        const resP = await axios.get(`/api/sessions/${sessionCode}/participants`);
        setParticipants(Array.isArray(resP.data) ? resP.data : []);
      } catch (err) {
        console.error("❌ Error joining session:", err);
        setError("Failed to join session.");
        navigate('/session-choice');
      } finally {
        setIsLoading(false);
      }
    };
  
    joinSession();
  
    return () => {
      socket.emit("leave-session", sessionCode);
      socket.off("connect", joinSession);
    };
  }, [sessionCode, navigate]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axios.get(`/api/sessions/${sessionCode}/participants`);
        const fetchedParticipants = Array.isArray(res.data) ? res.data : [];

        const { id: userId } = getUser();
        const isCreatorFromStorage = JSON.parse(sessionStorage.getItem("isCreator") || "false");

        const patchedParticipants = fetchedParticipants.map(p => {
        if (String(p.id) === String(userId)) {
    return { ...p, isCreator: isCreatorFromStorage };
  }
  return p;
});

// Participant handler to show how is what where

setParticipants(patchedParticipants);
        setParticipants(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Could not update participants:", err);
      }
    };

    socket.on('participantUpdate', fetchParticipants);
    socket.on('sessionStarted', async () => {
      try {
        const res = await axios.get(`/api/sessions/${sessionCode}/preferences`);
        const prefsFromServer = res.data;
        navigate(`/swipe?code=${sessionCode}`, {
          state: { preferences: prefsFromServer, isCreator },
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

  // Cody Copy 

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLaunchSession = async () => {
    try {
      await axios.post(`/api/sessions/${sessionCode}/launch`);
      socket.emit('startSession', sessionCode);
      navigate(`/swipe?code=${sessionCode}`, {
        state: { preferences: { ...preferences, selectedLocation }, isCreator },
      });
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

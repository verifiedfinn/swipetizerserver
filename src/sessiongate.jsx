import React, { useState } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SessionGate = ({ onSessionReady }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSessionCode(text);
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
    }
  };

  const handleCreateSession = () => {
    Axios.post('http://localhost:3001/create-session', {
      user_id: 1, // Replace with actual user_id from login
      preferences: {}
    })
    .then((res) => {
      const code = res.data.session_code;
      setCreatedCode(code);
      setSessionCode(code); // Automatically fill join input
    })
    .catch((err) => {
      console.error("Failed to create session:", err);
      alert("Could not create session.");
    });
  };

  const handleStartSwipetizing = () => {
    const code = createdCode || sessionCode;

    if (!code) return alert("Please create or join a session first.");

    Axios.post('http://localhost:3001/join-session', { session_token: code })
      .then((res) => {
        onSessionReady(code);
        setHasJoined(true);
        navigate('/filters'); // Redirect to filter page
      })
      .catch(() => {
        alert("Invalid session code.");
      });
  };

  return (
    <div className="session-gate">
      {!hasJoined ? (
        <>
          <h1>Welcome to Swipetizer</h1>
          
          <div>
            <button onClick={handleCreateSession}>Create Session</button>
            {createdCode && (
              <div style={{ marginTop: '10px' }}>
                <h3>SESSION CODE</h3>
                <input value={createdCode} readOnly />
                <button onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  alert("Code copied!");
                }}>
                  Copy
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={() => {}}>Join Session</button>
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Enter Code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
              />
              <button onClick={handlePasteCode}>Paste</button>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={handleStartSwipetizing}>Start Swipetizing</button>
          </div>
        </>
      ) : (
        <h2>Loading your session... 🍔</h2>
      )}
    </div>
  );
};

export default SessionGate;

import React, { useState } from 'react';

const SessionGate = ({ onSessionReady }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSessionCode(text);
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
    }
  };

  const handleCreateSession = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCreatedCode(randomCode);
  };

  const handleStartSwipetizing = () => {
    if (createdCode || sessionCode) {
      const code = createdCode || sessionCode;
      onSessionReady(code); // Code pass
      setHasJoined(true);
    } else {
      alert("Please create or join a session first.");
    }
  };

  return (
    <div className="session-gate">
      {!hasJoined && (
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
      )}

      {hasJoined && (
        <h2>Loading your session... 🍔</h2>
      )}
    </div>
  );
};

export default SessionGate;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // parse the session code from query params 
  const queryParams = new URLSearchParams(location.search);
  const sessionCode = queryParams.get('code') || '1234';
  
  // local state
  const [isCreator, setIsCreator] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // check the session status 
  useEffect(() => {
    const getSessionInfo = async () => {
      try {
        setIsLoading(true);
        
        // get session details
        const response = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}`);
        
        if (response.data) {
          // check if current user is the creator
          const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
          
          if (userId && response.data.createdBy === parseInt(userId)) {
            setIsCreator(true);
          }
        } else {
          // if no session found, go to session creation page
          navigate('/session');
        }
      } catch (err) {
        console.error("Error fetching session info:", err);
        setError("Could not load session information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    getSessionInfo();
  }, [sessionCode, navigate]);
  
  // load the parpticpants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/participants`);
        
        if (response.data) {
          setParticipants(response.data);
        }
      } catch (err) {
        console.error("Error fetching participants:", err);
      }
    };
    
    // fetch participants 
    fetchParticipants();
    
    // poll to check for new participants
    const interval = setInterval(fetchParticipants, 3000);
    
    return () => clearInterval(interval);
  }, [sessionCode]);

  // check if sessionlaunched 
  useEffect(() => {
    if (isCreator) return; // don't needto check if user is the creator
    
    const checkSessionStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/sessions/${sessionCode}/status`);
        
        if (response.data && response.data.status === 'active') {
          // if session is active go to swipe page
          navigate('/home');
        }
      } catch (err) {
        console.error("Error checking session status:", err);
      }
    };
    
    // poll for the session status
    const statusInterval = setInterval(checkSessionStatus, 2000);
    
    return () => clearInterval(statusInterval);
  }, [sessionCode, isCreator, navigate]);

  // handle copying session code
  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
      });
  };

  // launch session
  const handleLaunchSession = async () => {
    try {
      await axios.post(`http://localhost:3001/api/sessions/${sessionCode}/launch`);
      navigate('/home');
    } catch (err) {
      console.error("Error launching session:", err);
      setError("Failed to launch session. Please try again.");
    }
  };

  // leave session
  const handleLeaveSession = async () => {
    try {
      //  tell the server that the user is leaving if they are leaving
      await axios.post(`http://localhost:3001/api/sessions/${sessionCode}/leave`);
    } catch (err) {
      console.error("Error leaving session:", err);
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
        <button 
          className="create-session-btn"
          onClick={() => navigate('/session')}
        >
          Back to Session
        </button>
      </div>
    );
  }

  return (
    <div className="filter-page">
      <h1>Waiting Room</h1>
      
      {/*  display session code*/}
      <div className="session-code">
        <h3>SESSION CODE</h3>
        <div className="code-box">{sessionCode}</div>
        <button onClick={copySessionCode}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      
      {/* participants section */}
      <div className="section">
        <div className="label">Participants ({participants.length})</div>
        
        <div className="participants-container">
          {participants.length === 0 ? (
            <p className="waiting-message">Waiting for your friends to join...</p>
          ) : (
            participants.map((participant, index) => (
              <div key={index} className="participant-item">
                <span className="participant-name">
                  {participant.username || `Guest ${index + 1}`}
                  {participant.isCreator && <span className="creator-badge">Host</span>}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <hr />
      
      {/* waiting message */}
      <div className="section">
        <p className="waiting-message">
          {isCreator 
            ? "Waiting for your friends to join..." 
            : "Waiting for host to start the session..."}
        </p>
      </div>
      
      {/* action buttons */}
      {isCreator ? (
        <button 
          className="create-session-btn launch-button"
          onClick={handleLaunchSession}
          disabled={participants.length < 1}
        >
          Launch Session
        </button>
      ) : (
        <button 
          className="create-session-btn waiting-button"
          disabled={true}
        >
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
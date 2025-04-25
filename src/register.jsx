import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const register = () => {
    if (!email || !password) {
      setStatus("Please fill out both fields.");
      return;
    }

    Axios.post('/register', {
      username: email,
      password: password
    })
    .then((response) => {
      console.log(response.data);
    
      // Store user in localStorage
      if (response.data.user) {
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("username", response.data.user.name);
      }
    
      setStatus("✅ Registered successfully!");
      setTimeout(() => navigate('/session-choice'), 1000);
    })
      .catch((error) => {
        console.error(error);
        setStatus("❌ Registration failed.");
      });
  };

  return (
    <div className='container'>
      <div className="header">
        <div className="text">Registration</div>
      </div>

      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="submit-container">
        <button type="submit" onClick={register}>Register</button>
        </div>
        
        {status && <p style={{ marginTop: '10px' }}>{status}</p>}
      </div>
    </div>
  );
}

export default Register;





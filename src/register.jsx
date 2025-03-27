import React, { useState } from 'react';
import './styles.css';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom'; // routerchanger

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate(); // Hook into navigation

  const register = () => {
    if (!email || !password) {
      setStatus("Please fill out both fields.");
      return;
    }
  
    Axios.post('http://localhost:3001/register', {
      username: email,
      password: password
    })
      .then((response) => {
        console.log(response.data);
        setStatus("✅ Registered successfully!");
        navigate('/session-choice');
      })
      .catch((error) => {
        console.error(error);
        setStatus("❌ Registration failed.");
      });
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Registration</div>
      </div>

      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" onClick={register}>
          Register
        </button>

        {status && <p style={{ marginTop: '10px' }}>{status}</p>}
      </div>
    </div>
  );
}

export default Register;




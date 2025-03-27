import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import "./styles.css";

function Login() {
  const navigate = useNavigate(); // Hook for navigation

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");

  const login = () => {
    Axios.post("http://localhost:3001/login", {
      username: username,
      password: password,
    }).then((response) => {
      if (response.data.message) {
        setLoginStatus(response.data.message); 
      } else {
        setLoginStatus(`Welcome, ${response.data[0].username}!`);
        navigate("/home"); 
      }
    }).catch(error => {
      console.error("Login error:", error);
      setLoginStatus("Error logging in");
    });
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Login</div>
      </div>

      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="submit-container">
        <button type="submit" onClick={login}>Log In</button>
      </div>

      <h1>{loginStatus}</h1>
    </div>
  );
}

export default Login;
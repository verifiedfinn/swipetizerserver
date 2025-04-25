import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import "./styles.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");

  const login = () => {
    Axios.post("/login", {
      username,
      password,
    })
      .then((response) => {
        if (response.data.message === "Login successful") {
          const user = response.data.user;

          // ✅ Store in localStorage
          localStorage.setItem("userId", user.id);
          localStorage.setItem("email", user.email);

          setLoginStatus(`Welcome, ${user.name}!`);
          navigate("/session-choice");
        } else {
          setLoginStatus(response.data.message || "Login failed.");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        setLoginStatus("❌ Error logging in.");
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
      </div>

      <div className="submit-container">
        <button type="submit" onClick={login}>Log In</button>
      </div>

      {loginStatus && <h1>{loginStatus}</h1>}
    </div>
  );
}

export default Login;
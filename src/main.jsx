import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ FIXED: This must match `App.jsx`
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

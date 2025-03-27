const express = require("express");
const mysql = require('mysql2');
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Load .env config

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

// Use environment-based DB config from .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true 
});

// Connect and initialize tables from schema.sql
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");

  const schema = fs.readFileSync('./schema.sql', 'utf8');
  db.query(schema, (err) => {
    if (err) {
      console.error("❌ Failed to initialize schema:", err);
    } else {
      console.log("✅ All tables created or already exist.");
    }
  });
});

// ---------------------- RESTAURANTS ----------------------
app.get("/restaurants", (req, res) => {
  try {
    const data = fs.readFileSync(__dirname + "/localData.json", "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading localData.json:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
});

// ---------------------- REGISTER ----------------------
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log("🟨 Registration request:", username);

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, password_hash) VALUES (?, ?)",
      [username, hashed],
      (err, result) => {
        if (err) {
          console.error("❌ Registration failed:", err);
          res.status(500).send({ message: "Registration failed" });
        } else {
          console.log("✅ User registered:", result.insertId);
          res.send({ message: "User registered successfully" });
        }
      }
    );
  } catch (err) {
    console.error("❌ Hashing error:", err);
    res.status(500).send({ error: "Server error" });
  }
});

// ---------------------- LOGIN ----------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("🟨 Login attempt:", username);

  db.query(
    "SELECT * FROM users WHERE name = ?",
    [username],
    async (err, result) => {
      if (err) {
        console.error("❌ DB error:", err);
        return res.send({ err });
      }

      if (result.length > 0) {
        const match = await bcrypt.compare(password, result[0].password_hash);
        if (match) {
          console.log("✅ Login successful");
          res.send({ message: "Login successful", user: result[0] });
        } else {
          res.send({ message: "Invalid password" });
        }
      } else {
        res.send({ message: "User not found" });
      }
    }
  );
});

// ---------------------- CREATE SESSION ----------------------
app.post("/create-session", (req, res) => {
  const { user_id, session_token, preferences } = req.body;

  if (!session_token) {
    return res.status(400).send({ message: "Missing session_token" });
  }

  db.query(
    "INSERT INTO sessions (user_id, session_token, device_info, created_at) VALUES (?, ?, ?, NOW())",
    [user_id, session_token, JSON.stringify(preferences)],
    (err, result) => {
      if (err) {
        console.error("❌ Failed to create session:", err);
        return res.status(500).send({ message: "Failed to create session" });
      }

      console.log("✅ Session created:", session_token);
      res.send({ message: "Session created", session_code: session_token });
    }
  );
});

// ---------------------- JOIN SESSION ----------------------
app.post("/join-session", (req, res) => {
  const { session_token } = req.body;

  db.query(
    "SELECT * FROM sessions WHERE session_token = ?",
    [session_token],
    (err, result) => {
      if (err) {
        console.error("❌ Join session error:", err);
        return res.status(500).send({ message: "DB error" });
      }

      if (result.length > 0) {
        res.send({ message: "Session found", session: result[0] });
      } else {
        res.status(404).send({ message: "Session not found" });
      }
    }
  );
});

// ---------------------- FILTER PREFERENCES ----------------------
app.post("/save-preferences", (req, res) => {
  const { user_id, food_preferences } = req.body;

  db.query(
    "UPDATE users SET food_preferences = ? WHERE id = ?",
    [JSON.stringify(food_preferences), user_id],
    (err) => {
      if (err) {
        console.error("❌ Failed to save preferences:", err);
        return res.status(500).send({ message: "Error saving preferences" });
      }

      res.send({ message: "Preferences updated!" });
    }
  );
});

// ---------------------- CATCH ALL ----------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
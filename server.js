require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const sessionParticipants = {};

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");

  const schema = fs.readFileSync("./schema.sql", "utf8");
  db.query(schema, (err) => {
    if (err) {
      console.error("❌ Failed to initialize schema:", err);
    } else {
      console.log("✅ All tables created or already exist.");
    }
  });
});

// ---------------------- SESSION DETAIL ROUTE ----------------------
app.get("/api/sessions/:code", (req, res) => {
  const code = req.params.code;

  db.query(
    "SELECT * FROM sessions WHERE session_token = ?",
    [code],
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching session by code:", err);
        return res.status(500).send({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).send({ message: "Session not found" });
      }

      const session = results[0];
      res.send({
        ...session,
        createdBy: session.user_id
      });
    }
  );
});

// ---------------------- PARTICIPANTS ROUTE ----------------------
app.get("/api/sessions/:code/participants", (req, res) => {
  const code = req.params.code;
  const participants = sessionParticipants[code] || [];
  res.json(participants);
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
          return res.status(500).send({ message: "Registration failed" });
        }

        const newUser = {
          id: result.insertId,
          name: username
        };

        res.send({ message: "User registered successfully", user: newUser });
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
      if (err) return res.send({ err });

      if (result.length > 0) {
        const match = await bcrypt.compare(password, result[0].password_hash);
        if (match) {
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

      res.send({ message: "Session created", session_code: session_token });
      io.to(session_token).emit("participantUpdate");
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
      if (err) return res.status(500).send({ message: "DB error" });

      if (result.length > 0) {
        res.send({ message: "Session found", session: result[0] });
      } else {
        res.status(404).send({ message: "Session not found" });
      }
    }
  );
});

// ---------------------- LAUNCH SESSION ----------------------
app.post("/api/sessions/:code/launch", (req, res) => {
  const code = req.params.code;

  // This emits to all connected clients in the room
  io.to(code).emit("sessionStarted");

  console.log(`🚀 Launch request received for session ${code}`);
  res.send({ message: "Session launched successfully" });
});

// ---------------------- SAVE PREFERENCES ----------------------
app.post("/save-preferences", (req, res) => {
  const { user_id, food_preferences } = req.body;

  db.query(
    "UPDATE users SET food_preferences = ? WHERE id = ?",
    [JSON.stringify(food_preferences), user_id],
    (err) => {
      if (err) {
        return res.status(500).send({ message: "Error saving preferences" });
      }

      res.send({ message: "Preferences updated!" });
    }
  );
});

// ---------------------- SOCKET.IO HANDLERS ----------------------
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("joinRoom", ({ sessionCode, user }) => {
    if (!sessionCode) {
      console.warn("❗ joinRoom missing sessionCode");
      return;
    }
  
    socket.join(sessionCode);
  
    if (!sessionParticipants[sessionCode]) {
      sessionParticipants[sessionCode] = [];
    }
  
    const userId = user.id || `guest-${socket.id}`;
    const username = user.username || `Guest ${Math.floor(Math.random() * 1000)}`;
    const isCreator = Boolean(user.isCreator); // ✅ preserves value from frontend
  
    const alreadyInRoom = sessionParticipants[sessionCode].some(p => String(p.id) === String(userId));
    if (!alreadyInRoom) {
      sessionParticipants[sessionCode].push({ id: userId, username, isCreator });
    }
  
    console.log(`🔗 ${username} joined room ${sessionCode} (Host: ${isCreator})`);
    console.log("👥 Current participants:", sessionParticipants[sessionCode]);
  
    io.to(sessionCode).emit("participantUpdate");
  });

  socket.on("startSession", (sessionCode) => {
    console.log(`🚀 Session started in room ${sessionCode}`);
    io.to(sessionCode).emit("sessionStarted");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    // Optionally remove the user from sessionParticipants here
  });
});

// ---------------------- CATCH ALL ----------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 3001;
http.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO running on http://0.0.0.0:${PORT}`);
});
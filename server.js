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
const sessionSwipes = {};
const matchedRestaurants = {};

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

// ---------------------- ROUTES ----------------------

app.get("/api/sessions/:code", (req, res) => {
  const code = req.params.code;
  db.query(
    "SELECT * FROM sessions WHERE session_token = ?",
    [code],
    (err, results) => {
      if (err) return res.status(500).send({ message: "Server error" });
      if (results.length === 0) return res.status(404).send({ message: "Session not found" });
      const session = results[0];
      res.send({ ...session, createdBy: session.user_id });
    }
  );
});

// GET /api/sessions/:code/preferences
app.get("/api/sessions/:code/preferences", (req, res) => {
  const code = req.params.code;
  db.query(
    "SELECT device_info FROM sessions WHERE session_token = ?",
    [code],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error retrieving preferences" });
      if (results.length === 0) return res.status(404).json({ message: "Session not found" });

      try {
        const prefs = JSON.parse(results[0].device_info);
        res.json(prefs);
      } catch (e) {
        res.status(500).json({ message: "Malformed preferences" });
      }
    }
  );
});

app.get("/api/sessions/:code/participants", (req, res) => {
  const code = req.params.code;
  res.json(sessionParticipants[code] || []);
});

app.get("/restaurants", (req, res) => {
  try {
    const data = fs.readFileSync(__dirname + "/localData.json", "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading localData.json:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, password_hash) VALUES (?, ?)",
      [username, hashed],
      (err, result) => {
        if (err) return res.status(500).send({ message: "Registration failed" });
        res.send({ message: "User registered successfully", user: { id: result.insertId, name: username } });
      }
    );
  } catch {
    res.status(500).send({ error: "Server error" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM users WHERE name = ?", [username], async (err, result) => {
    if (err) return res.send({ err });
    if (result.length > 0) {
      const match = await bcrypt.compare(password, result[0].password_hash);
      res.send(match ? { message: "Login successful", user: result[0] } : { message: "Invalid password" });
    } else {
      res.send({ message: "User not found" });
    }
  });
});

app.post("/create-session", (req, res) => {
  const { user_id, session_token, preferences } = req.body;
  if (!session_token) return res.status(400).send({ message: "Missing session_token" });

  db.query(
    "INSERT INTO sessions (user_id, session_token, device_info, created_at) VALUES (?, ?, ?, NOW())",
    [user_id, session_token, JSON.stringify(preferences)],
    (err) => {
      if (err) return res.status(500).send({ message: "Failed to create session" });
      res.send({ message: "Session created", session_code: session_token });
      io.to(session_token).emit("participantUpdate");
    }
  );
});

app.post("/join-session", (req, res) => {
  const { session_token } = req.body;
  db.query("SELECT * FROM sessions WHERE session_token = ?", [session_token], (err, result) => {
    if (err) return res.status(500).send({ message: "DB error" });
    if (result.length > 0) {
      res.send({ message: "Session found", session: result[0] });
    } else {
      res.status(404).send({ message: "Session not found" });
    }
  });
});

app.post("/api/sessions/:code/launch", (req, res) => {
  const code = req.params.code;
  io.to(code).emit("sessionStarted");
  res.send({ message: "Session launched successfully" });
});

app.post("/save-preferences", (req, res) => {
  const { user_id, food_preferences } = req.body;
  db.query(
    "UPDATE users SET food_preferences = ? WHERE id = ?",
    [JSON.stringify(food_preferences), user_id],
    (err) => {
      if (err) return res.status(500).send({ message: "Error saving preferences" });
      res.send({ message: "Preferences updated!" });
    }
  );
});

// ---------------------- SOCKET.IO ----------------------

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("joinRoom", ({ sessionCode, user }) => {
    if (!sessionCode) return;

    socket.join(sessionCode);

    if (!sessionParticipants[sessionCode]) sessionParticipants[sessionCode] = [];
    if (!sessionSwipes[sessionCode]) sessionSwipes[sessionCode] = [];

    const userId = user.id || `guest-${socket.id}`;
    const username = user.username || `Guest ${Math.floor(Math.random() * 1000)}`;
    const isCreator = Boolean(user.isCreator);

    sessionParticipants[sessionCode] = sessionParticipants[sessionCode].filter((p) => p.id !== userId);
    sessionParticipants[sessionCode].push({ id: userId, username, isCreator, socketId: socket.id });

    io.to(sessionCode).emit("participantUpdate");
  });

  socket.on("swipe", ({ sessionCode, userId, restaurantId, direction }) => {
    console.log(`👆 Swipe received: ${userId} swiped ${direction} on ${restaurantId} in ${sessionCode}`);
  
    if (!sessionCode || !userId || !restaurantId || !direction) {
      console.log("❌ Missing swipe data");
      return;
    }
  
    if (direction === "right") {
      if (!sessionSwipes[sessionCode]) sessionSwipes[sessionCode] = [];
      sessionSwipes[sessionCode].push({ userId, restaurantId });
  
      console.log("🧠 All swipes for this session:", sessionSwipes[sessionCode]);
  
      if (!matchedRestaurants[sessionCode]) matchedRestaurants[sessionCode] = [];
      if (matchedRestaurants[sessionCode].includes(restaurantId)) {
        console.log("🛑 Already matched:", restaurantId);
        return;
      }
  
      const swipes = sessionSwipes[sessionCode].filter((s) => s.restaurantId === restaurantId);
      const uniqueUsers = [...new Set(swipes.map((s) => s.userId))];
      console.log("📊 Unique users who swiped right on", restaurantId, ":", uniqueUsers);
  
      if (uniqueUsers.length >= 2) {
        console.log(`💘 MATCH FOUND on ${restaurantId} for users:`, uniqueUsers);
        matchedRestaurants[sessionCode].push(restaurantId);
        io.to(sessionCode).emit("matchFound", { restaurantId, users: uniqueUsers });
  
        // Cleanup
        sessionSwipes[sessionCode] = sessionSwipes[sessionCode].filter((s) => s.restaurantId !== restaurantId);
      }
    }
  });

  socket.on("startSession", (sessionCode) => {
    io.to(sessionCode).emit("sessionStarted");
  });

  socket.on("leave-session", (sessionCode) => {
    if (!sessionCode || !sessionParticipants[sessionCode]) return;
    sessionParticipants[sessionCode] = sessionParticipants[sessionCode].filter((p) => p.socketId !== socket.id);
    socket.leave(sessionCode);
    io.to(sessionCode).emit("participantUpdate");
  });

  socket.on("disconnect", () => {
    for (const sessionCode in sessionParticipants) {
      sessionParticipants[sessionCode] = sessionParticipants[sessionCode].filter((p) => p.socketId !== socket.id);
      if (sessionParticipants[sessionCode].length === 0) {
        delete sessionParticipants[sessionCode];
        delete sessionSwipes[sessionCode];
        delete matchedRestaurants[sessionCode];
      }
      io.to(sessionCode).emit("participantUpdate");
    }
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ---------------------- FALLBACK ROUTE ----------------------

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------------------- START SERVER ----------------------

const PORT = process.env.PORT || 3001;
http.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO running on http://0.0.0.0:${PORT}`);
});

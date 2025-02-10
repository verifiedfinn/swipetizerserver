const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(__dirname));

app.get("/restaurants", (req, res) => {
    try {
        const data = fs.readFileSync(__dirname + "/localData.json", "utf8");
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Error reading localData.json:", error);
        res.status(500).json({ error: "Failed to load data" });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

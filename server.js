const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "root",
    database: "swipetizer",
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

app.post('/register', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    db.query("INSERT INTO users (username, password) VALUES (?,?)", 
        [username, password], 
        (err, result) => {
            console.log(err);
            if (err) {
                console.log(err);
                res.status(500).send({ message: "Registration failed", error: err });
              } else {
                res.status(200).send({ message: "User registered successfully!" });
              }
            }
        );
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT * FROM users WHERE username = ? AND password = ?", 
        [username, password], 
        (err, result) => {

            if(err){
               res.send({err: err});
            } 
            else if(result.length > 0){
               res.send(result);
             } else {
                res.send({message: "Wrong username/password combination"});
             }
        }
    );
});



app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
// Import required modules
const express = require("express");
const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Import custom modules
// const routes = require("./modules/routes.js");

const app = express();
const port = process.env.PORT || 3000;

// Create a new database, set as the "db" object
const db = new sqlite3.Database("db/db.db", (err) => {
    if (err) {
        console.error("Failed to connect to the database: ", err);
        process.exit(1); // exit the process
    }
});

// Set view engine
app.set("view engine", "ejs");

// Use middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
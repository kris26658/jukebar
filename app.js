// Import required modules
const express = require("express");
const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Import custom modules
const routes = require("./modules/routes.js");
const { isAuthenticated, AUTH_URL, THIS_URL } = require("./modules/authentication.js");

const app = express();
const port = process.env.PORT || 3000;

// Create a new database, set as the "db" object
const db = new sqlite3.Database("db/database.db", (err) => {
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
app.use(session({
    secret: 'make up a secret string here but never publish it!',
    resave: false,
    saveUninitialized: false
}));

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index.ejs', { user: req.session.user });
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        username = req.session.user;
        res.redirect('/');
    } else {
        res.render('login.ejs', { AUTH_URL, THIS_URL });
    }
});

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
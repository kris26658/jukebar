const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");

//set URLs
const AUTH_URL = "https://formbar.yorktechapps.com/oauth";
const THIS_URL = "http://localhost:3000/login";

//create a new database, set as the "db" object
const db = new sqlite3.Database("db/database.db", (err) => {
    if (err) {
        console.error("Failed to connect to the database: ", err);
        process.exit(1); //exit the process
    };
});

/*----------
GET Requests
----------*/

//create root function
const index = (req, res) => {
    if (req.session.user) {
        //user is logged in
        res.render("index", { username: req.session.user });
    } else {
        //user is not logged in
        res.render("index", { username: null });
    };
};

//handle login
const loginGET = (req, res) => {
    //extract token from the Authorization header
    const token = req.query.token;

    if (!token) {
        res.render("login", { AUTH_URL: AUTH_URL, THIS_URL: THIS_URL });
    } else if (token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        res.redirect("/");
    }
};

//handle logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send("Error destroying session: " + err);
        } else {
            res.redirect("/login");
        };
    });
};

/*-----------
POST Requests
-----------*/

const loginPOST = (req, res) => {
    //extract token from the Authorization header
    const token = req.query.token;
    const { user, pass } = req.body;

   
        //login with formbar
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).send("Token has expired. Please log in again.");
                } else if (err.name === "JsonWebTokenError") {
                    return res.status(400).send("Invalid token.");
                } else {
                    return res.status(500).send("An unknown error occurred.");
                };
            };
            //store username in the session
            req.session.user = decoded.username;
            console.log("Session User:", req.session.user);
            res.redirect("/");
        });
};

module.exports = {
    index,
    loginGET,
    logout,
    loginPOST
};
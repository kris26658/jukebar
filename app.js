const express = require("express");
const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs');


const routes = require("./modules/routes.js");

const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database("db/database.db", (err) => {
    if (err) {
        console.error("Failed to connect to the database: ", err);
        process.exit(1); // exit the process
    }
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: 'ThisIsTheSuperSigmerSecretKeyThatIsUsedToSignTheSessionIDNobodyWillEverGuessThisCauseItsSoLongAndImSigmaNowHeresARandomStringOfNumbersToMakeItEvenLonger123456789093784983749837498374987234987264928734629874629837612893746219873461298476123847962348976123487965213489762348972314875234987123648923714698123468231746198472364981723649812734698127346981723649',
    resave: false,
    saveUninitialized: false
}));

app.use('/', routes);

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        let username = tokenData.username;
        let permissions = tokenData.permissions;
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error("Failed to query the database: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            if (!row) {
                console.log("User not found in database, inserting...");
                db.run('INSERT INTO users (username) VALUES (?)', [username], (err) => {
                    if (err) {
                        console.error("Failed to insert user into database: ", err);
                    } else {
                        db.run('INSERT INTO classusers (permissions) VALUES (?)', [permissions], (err) => {
                            if (err) {
                                console.error("Failed to insert user into classusers: ", err);
                            } else {
                                req.session.user = username;
                                req.session.permissions = permissions;
                                res.redirect('/');
                                console.log("User inserted into database successfully!");
                            }
                        });
                    }
                });
            } else {
                req.session.user = username;
                req.session.permissions = permissions;
                res.redirect('/');
            }
        });

    } else {
        res.redirect('https://formbar.yorktechapps.com/oauth?redirectURL=http://localhost:3000/login');
    }
});

app.get('/getuserpermissions'), (req, res) => {
    if (req.session.permissions) {
        res.send(req.session.permissions);
    } else {
        res.status(401).send("Unauthorized");
    }
};

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
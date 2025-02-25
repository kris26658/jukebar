const express = require("express");
const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs');
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

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
        let username = tokenData.username;
        let permissions = tokenData.permissions;
        let classID = tokenData.classID;
        let className = tokenData.className;
        let classPermissions = tokenData.classPermissions;
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
                req.session.classID = classID;
                req.session.className = className;
                res.redirect('/');
            }
        });

    } else {
        res.redirect('https://formbar.yorktechapps.com/oauth?redirectURL=http://localhost:3000/login');
    }
});

app.get('/spotifyLogin', (req, res) => {
    const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-private', 'playlist-read-collaborative'];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Error:', error);
        res.send(`Error: ${error}`);
        return;
    }
    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        // Set the access token and refresh token for the API calls
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Send the user to the next page (adjust for your setup)
        res.redirect('/spotify');

        // Handle token refresh in the background
        setInterval(async () => {
            try {
                const data = await spotifyApi.refreshAccessToken();
                const newAccessToken = data.body['access_token'];
                spotifyApi.setAccessToken(newAccessToken);
                console.log('Token refreshed:', newAccessToken); // Log the refreshed token if needed
            } catch (err) {
                console.error('Error refreshing access token:', err);
            }
        }, (expiresIn / 2) * 1000); // Refresh half the expiration time

    }).catch(error => {
        console.error('Error during authorization:', error);
        res.status(500).send(`Error during authorization: ${error.message}`);
    });
});

app.get('/search', (req, res) => {
    const { q } = req.query;

    // Validate the query parameter
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).send('Bad Request: Missing or invalid query parameter');
    }

    // Check if the access token is set before making the search request
    if (!spotifyApi.getAccessToken()) {
        return res.status(401).send('Unauthorized: Access token missing or invalid');
    }

    spotifyApi.searchTracks(q)
        .then(searchData => {
            if (searchData.body.tracks.items.length > 0) {
                const track = searchData.body.tracks.items[0]; // Grab the first track from the search results
                const trackInfo = {
                    name: track.name,
                    artist: track.artists[0].name,
                    uri: track.uri,
                    cover: track.album.images[0].url, // Get the album cover URL
                };
                res.json(trackInfo);
            } else {
                res.status(404).json({ error: 'No tracks found' });
            }
        })
        .catch(err => {
            console.error('Error searching tracks:', JSON.stringify(err, null, 2)); // Log the full error
            res.status(500).send(`Error: ${err.message}`); // Return detailed error message
        });
});


app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
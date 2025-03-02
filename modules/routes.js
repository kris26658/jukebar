const express = require('express');
const router = express.Router();
const { spotifyApi, SPOTIFY_SCOPES } = require('./spotify/config');
const { handleSpotifySearch, handlePlayTrack } = require('./spotify/handlers');
const { findUser, insertUser } = require('./db/database');
const { isAuthenticated } = require('./authentication');

router.get('/', (req, res) => {
    if (!req.session.user) {
        res.redirect(`http://localhost:420/oauth?redirectURL=http://localhost:3000/login`);
    } else {
        try {
            res.render('index.ejs', { username: req.session.user });
        } catch (error) {
            res.send(error.message);
        }
    }
});

router.get('/spotifyLogin', (_, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(SPOTIFY_SCOPES));
});

router.get('/search', handleSpotifySearch);
router.post('/play', handlePlayTrack);

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.get('/soundboard', (_, res) => res.render('soundboard.ejs'));
router.get('/youtube', (_, res) => res.render('youtube.ejs'));
router.get('/spotify', (_, res) => res.render('spotify.ejs'));

module.exports = router;

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
router.get('/youtube', (req, res)=> {
    res.render('youtube.ejs');
});

const spotify = (_, res) => {
    res.render('spotify.ejs');
};

router.get('/', index);
router.get('/logout', logout);
router.get('/soundboard', soundboard);
router.get('/youtube', youtube);
router.get('/spotify', spotify);
module.exports = router;

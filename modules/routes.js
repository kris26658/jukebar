const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAuthenticated, AUTH_URL, THIS_URL } = require('./authentication.js');

const index = (req, res) => {
    if (!req.session.user) {
        res.redirect(`https://formbar.yorktechapps.com/oauth?redirectURL=http://localhost:3000/login`);
    } else {
        try {
            res.render('index.ejs', { username: req.session.user });
        } catch (error) {
            res.send(error.message);
        }
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const soundboard = (_, res) => {
    res.render('soundboard.ejs');
};

router.get('/', index);
router.get('/logout', logout);
router.get('/soundboard', soundboard);
module.exports = router;
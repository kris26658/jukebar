const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAuthenticated, AUTH_URL, THIS_URL } = require('./authentication.js');

const index = (req, res) => {
    try {
        if (req.session.permissions < 5) {
            res.render('index.ejs', { user: req.session.user });
        } else if (req.session.permissions >= 5) {
            res.render('teacher.ejs', { user: req.session.user });
        }
    } catch (error) {
        res.send(error.message);
    }
};

const login = (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.permissions = tokenData.permissions;
        username = tokenData.username;
        res.redirect('/');
    } else {
        res.render('login.ejs', { AUTH_URL, THIS_URL });
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

router.get('/', isAuthenticated, index);
router.get('/login', login);
router.get('/logout', logout);

module.exports = router;
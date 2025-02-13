const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAuthenticated, AUTH_URL, THIS_URL } = require('./authentication.js');

const index = (req, res) => {
    if (!req.session.user) {
        res.redirect(`https://formbar.yorktechapps.com/oauth?redirectURL=http://localhost:3000/login`);
    } else {
        try {
            if (req.session.permissions < 5) {
                res.render('index.ejs', { user: req.session.user });
            } else if (req.session.permissions >= 5) {
                res.render('teacher.ejs', { user: req.session.user });
            }
        } catch (error) {
            res.send(error.message);
        }
    }
};

const login = (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.permissions = tokenData.permissions;
        req.session.class = tokenData.class;
        username = req.session.user;
        classID = req.session.class;
        res.redirect('/');
    } else {
        res.redirect('https://formbar.yorktechapps.com/oauth?redirectURL=http://localhost:3000/login');
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

router.get('/', index);
router.get('/login', login);
router.get('/logout', logout);

module.exports = router;
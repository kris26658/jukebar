const AUTH_URL = 'https://formbeta.yorktechapps.com/oauth';
const THIS_URL = 'http://localhost:3000/login';

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    }
}

module.exports = {
    isAuthenticated,
    AUTH_URL,
    THIS_URL
};

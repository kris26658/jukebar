/*----------
GET Requests
----------*/

//create root function
const index = (req, res) => {
    res.render("index");
};

const login = (req, res) => {
    res.render("login");
};

module.exports = {
    index
};
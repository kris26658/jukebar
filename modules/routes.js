/*----------
GET Requests
----------*/

//create root function
const index = (req, res) => {
    res.render("index");
};

module.exports = {
    index
};
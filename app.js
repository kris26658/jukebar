//to install required modules in the terminal: type "npm i express express-session ejs jsonwebtoken sqlite3 connect-sqlite3 socket.io path"

//import external modules
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session); //create the "SQLiteStore" object from session
const socketIO = require("socket.io");
const path = require("path");

//import custom modules
const routesMod = require("./modules/routes.js")
const socketMod = require("./modules/socket.js")

/*-----------
Server Config
-----------*/

const app = express(); //initialize express, set as the "app" object
const port = process.env.PORT || 3000; //set the port number

//initialize the server, set as the "server" object
const server = app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
});

const io = socketIO(server); //create the "io" object from the server

//initiaize session, set as the "session_MIDDLEWARE" object
const session_MIDDLEWARE = session({
    store: new SQLiteStore,
    secret: "key_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

//create isAuthenticated function
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) next();
    else res.redirect("/login");
};

app.set("view engine", "ejs"); //set ejs as the view engine
app.use(session_MIDDLEWARE); //configure the server to use middleware
app.use(express.urlencoded({ extended: true })); //encode url

//configure the server to use routes from routes.js
app.get("/", routesMod.index);
app.get("/login", routesMod.loginGET);
app.get("/logout", isAuthenticated, routesMod.logout);
app.get("/chat", isAuthenticated, routesMod.chat);
app.post("/login", routesMod.loginPOST);

app.use(express.static(path.join(__dirname, "public"))); //configure use the static "public" folder for requests

//configure the io object to use middleware
io.use((socket, next) => {
    session_MIDDLEWARE(socket.request, {}, next);
});

//configure the io object to use connect from socket.js
io.on("connection", (socket) => {
    socketMod.socketHandler(socket, io);
});
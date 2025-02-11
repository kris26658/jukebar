// Import required modules
const express = require("express");
const ejs = require("ejs");
const db = require("sqlite3").verbose();
const socketIO = require("socket.io");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");

// Import custom modules
const routesMod = require("./modules/routes.js");
const socketMod = require("./modules/socket.js");

/*-----------
Server Config
-----------*/

const app = express();
const port = process.env.PORT || 3000;

const io = socketIO(server);

// Initialize session middleware
const session_MIDDLEWARE = session({
    store: new SQLiteStore(),
    secret: "key_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) next();
    else res.redirect("/login");
}

// Set view engine
app.set("view engine", "ejs");

// Use middleware
app.use(session_MIDDLEWARE);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configure routes
app.get("/", routesMod.index);
app.get("/login", routesMod.loginGET);
app.get("/logout", isAuthenticated, routesMod.logout);
app.post("/login", routesMod.loginPOST);

// Configure socket.io middleware
io.use((socket, next) => {
    session_MIDDLEWARE(socket.request, {}, next);
});

// Configure socket.io connection
io.on("connection", (socket) => {
    socketMod.socketHandler(socket, io);
});

const server = app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
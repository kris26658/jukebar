// Import required modules
const express = require("express");
const ejs = require("ejs");
const db = require("sqlite3").verbose();
const socketIO = require("socket.io");
const path = require("path");

// Import custom modules
const routes = require("./modules/routes.js");

const app = express();
const port = process.env.PORT || 3000;

// Set view engine
app.set("view engine", "ejs");

// Use middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configure routes
app.get("/", routes.index);
app.get("/login", routes.loginGET);
app.get("/logout", routes.logout);
app.post("/login", routes.loginPOST);


app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("db/database.db", (err) => {
    if (err) {
        console.error("Failed to connect to the database: ", err);
        process.exit(1);
    }
});

const insertUser = (username, permissions) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username) VALUES (?)', [username], function(err) {
            if (err) {
                reject(err);
                return;
            }
            db.run('INSERT INTO classusers (permissions) VALUES (?)', [permissions], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
};

const findUser = (username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
};

module.exports = {
    db,
    insertUser,
    findUser
};
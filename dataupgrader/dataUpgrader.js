const fs = require('fs');
const { database, dbRun, dbGetAll } = require('../modules/db/database.js');

function getDatabaseVersion(db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="stats"', (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    // Get dbVersion
                    db.get('SELECT * FROM stats WHERE key="dbVersion"', (err, row) => {
                        if (err) {
                            reject(err);
                        } else if (row && row.value !== undefined) {
                            resolve(row.value);
                        } else {
                            resolve(null);
                        }
                    });
                } else {
                    // Database is pre-v1 and has no stats table
                    resolve(null);
                }
            }
        });
    });
}

async function upgradeDatabase() {
    const currentVersion = "1.0";
    
    try {
        const version = await getDatabaseVersion(database);
        if (version === currentVersion) {
            console.log('Database is up to date');
            return;
        }

        console.log('Upgrading database to version', currentVersion);
        
        // Get template tables
        const templateTables = await dbGetAll('SELECT name FROM sqlite_master WHERE type="table"', [], database);
        
        for (const table of templateTables) {
            const tableExists = await dbGetAll('SELECT name FROM sqlite_master WHERE type="table" AND name=?', [table.name], database);
            if (tableExists.length == 0) {
                await createTable(table.name);
            }
        }

        // Update the database version
        await dbRun('CREATE TABLE IF NOT EXISTS "stats" (key TEXT NOT NULL, value TEXT)');
        await dbRun('INSERT OR REPLACE INTO stats (key, value) VALUES ("dbVersion", ?)', [currentVersion]);
        // console.log(`Database upgraded to version ${currentVersion}`);
    } catch (error) {
        console.error('Error upgrading database:', error);
        throw error;
    }
}

module.exports = {
    upgradeDatabase
};
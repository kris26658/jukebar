const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

function initializeDatabase() {
    try {
        // Use absolute paths
        const dbDir = path.resolve(process.cwd(), 'db');
        const dbPath = path.join(dbDir, 'database.db');
        const templatePath = path.join(dbDir, 'database-template.db');

        console.log('Database directory path:', dbDir);
        console.log('Database file path:', dbPath);
        console.log('Template path:', templatePath);

        // Create db directory with recursive option
        if (!fs.existsSync(dbDir)) {
            console.log('Creating database directory...');
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Verify directory was created
        if (!fs.existsSync(dbDir)) {
            throw new Error(`Failed to create directory: ${dbDir}`);
        }

        // Check if database already exists
        if (fs.existsSync(dbPath)) {
            console.log('Using existing database at:', dbPath);
            return new sqlite3.Database(dbPath);
        }

        // Verify template exists
        if (!fs.existsSync(templatePath)) {
            console.error('Template database not found at:', templatePath);
            throw new Error('Database template not found. Please run create-template.js first.');
        }

        // Copy template to new database
        console.log('Creating new database from template...');
        fs.copyFileSync(templatePath, dbPath);
        console.log('Database created successfully at:', dbPath);

        return new sqlite3.Database(dbPath);
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Initialize database
let database;
try {
    database = initializeDatabase();
} catch (error) {
    console.error('Fatal error initializing database:', error);
    process.exit(1);
}

const dbGet = (query, params) => {
    return new Promise((resolve, reject) => {
        database.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        database.run(query, params, function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

const dbGetAll = (query, params) => {
    return new Promise((resolve, reject) => {
        database.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

module.exports = { db: database, dbGet, dbRun, dbGetAll };
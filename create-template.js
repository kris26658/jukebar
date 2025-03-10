const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

try {
    // Use absolute paths
    const dbDir = path.resolve(process.cwd(), 'db');
    const templatePath = path.join(dbDir, 'database-template.db');

    console.log('Database directory path:', dbDir);
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

    // Create template database
    console.log('Creating template database...');
    const db = new sqlite3.Database(templatePath);

    db.serialize(() => {
        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                displayName TEXT,
                digipogs INTEGER
            )
        `);

        // Create classusers table
        db.run(`
            CREATE TABLE IF NOT EXISTS classusers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                permissions TEXT,
                digiPogs INTEGER,
                classId TEXT,
                studentId TEXT,
                FOREIGN KEY (studentId) REFERENCES users(username)
            )
        `);

        // Create classrooms table
        db.run(`
            CREATE TABLE IF NOT EXISTS classrooms (
                classId INTEGER PRIMARY KEY AUTOINCREMENT,
                className TEXT,
                owner TEXT,
                key TEXT
            )
        `);

        console.log('Template database created successfully');
    });

    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
            process.exit(1);
        } else {
            console.log('Template database closed successfully');
        }
    });
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}

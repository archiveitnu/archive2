const mysql = require("mysql2");

// Connect to MySQL server
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

// Create database and table
db.connect(err => {
    if (err) throw err;

    console.log("Connected to MySQL");

    db.query("CREATE DATABASE IF NOT EXISTS rbac_db", err => {
        if (err) throw err;

        console.log("Database created");

        db.changeUser({ database: "rbac_db" }, err => {
            if (err) throw err;

            const sql = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE,
                    password VARCHAR(100),
                    role VARCHAR(20)
                )
            `;

            db.query(sql, err => {
                if (err) throw err;

                console.log("Users table created");

                // Insert default users
                const insert = `
                    INSERT IGNORE INTO users (username, password, role)
                    VALUES
                    ('admin', '1234', 'admin'),
                    ('student', '1234', 'user')
                `;

                db.query(insert, err => {
                    if (err) throw err;

                    console.log("Default users added");
                });
            });
        });
    });
});

module.exports = db;
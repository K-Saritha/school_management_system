

require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

connection.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }

    console.log("Connected to MySQL");

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS schools (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            
            UNIQUE (latitude, longitude)
        )
    `;

    connection.query(createTableQuery, (err) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log("Schools table ready");
        
    });
    
});

module.exports = connection;
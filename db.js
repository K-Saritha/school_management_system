require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});
function startServer() {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
connection.connect((err) => {
    if (err) {
        console.log("Connection failed:", err);
        return;
    }

    console.log("Connected to MySQL");

    connection.query(
        "CREATE DATABASE IF NOT EXISTS school_management_system",
        (err, result) => {
            if (err) {
                console.log(err);
                return;
            }

            console.log(result);
            console.log("Database ready");

           
            connection.query(
                "USE school_management_system",
                (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    console.log("Using database");

                    const createTableQuery = `
                        CREATE TABLE IF NOT EXISTS schools (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            address VARCHAR(255) NOT NULL,
                            latitude FLOAT NOT NULL,
                            longitude FLOAT NOT NULL
                        )
                    `;

                    connection.query(createTableQuery, (err, result) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        console.log(result);
                        console.log("Schools table created");
                        startServer();
                       
                    });
                }
            );

        }
    );
});
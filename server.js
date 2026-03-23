require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

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

    console.log("Connected to database");
});



function validateName(name) {
    if (!name || name.trim().length === 0) {
        return "Name is required";
    }

    const pattern = /^[A-Za-z ]+$/;

    if (!pattern.test(name.trim())) {
        return "Name must contain only letters and spaces";
    }

    if (name.trim().length > 100) {
        return "Name cannot exceed 100 characters";
    }

    return null;
}

function validateFlat(flat) {
    if (!flat || flat.trim().length === 0) {
        return "Flat or House number is required";
    }

    if (flat.trim().length > 20) {
        return "Flat or House number too long";
    }

    return null;
}

function validateStreet(street) {
    if (!street || street.trim().length === 0) {
        return "Street is required";
    }

    const pattern = /^[A-Za-z0-9\s.#/-]+$/;

    if (!pattern.test(street.trim())) {
        return "Street contains invalid characters";
    }

    return null;
}

function validateCity(city) {
    if (!city || city.trim().length === 0) {
        return "City is required";
    }

    const pattern = /^[A-Za-z\s]+$/;

    if (!pattern.test(city.trim())) {
        return "City must contain only letters";
    }

    return null;
}

function validateState(state) {
    if (!state || state.trim().length === 0) {
        return "State is required";
    }

    const pattern = /^[A-Za-z\s]+$/;

    if (!pattern.test(state.trim())) {
        return "State must contain only letters";
    }

    return null;
}

function validatePincode(pincode) {
    if (!pincode) {
        return "Pincode is required";
    }

    const pattern = /^[0-9]{6}$/;

    if (!pattern.test(pincode)) {
        return "Pincode must be exactly 6 digits";
    }

    return null;
}

function validateCoordinates(latitudeNum, longitudeNum) {
    if (isNaN(latitudeNum) || isNaN(longitudeNum)) {
        return "Latitude and Longitude must be numbers";
    }

    if (latitudeNum < -90 || latitudeNum > 90) {
        return "Latitude must be between -90 and 90";
    }

    if (longitudeNum < -180 || longitudeNum > 180) {
        return "Longitude must be between -180 and 180";
    }

    return null;
}

app.get("/", (req, res) => {
    res.status(200).send("Welcome to the School Management System API");
});




app.post("/addSchool", upload.none(), (req, res) => {

    console.log("BODY:", req.body);

    const {
        name,
        flat,
        street,
        city,
        state,
        pincode,
        latitude,
        longitude
    } = req.body;

    const latitudeNum = parseFloat(latitude);
    const longitudeNum = parseFloat(longitude);

    let error;

    error = validateName(name);
    if (error) return res.status(400).json({ error });

    error = validateFlat(flat);
    if (error) return res.status(400).json({ error });

    error = validateStreet(street);
    if (error) return res.status(400).json({ error });

    error = validateCity(city);
    if (error) return res.status(400).json({ error });

    error = validateState(state);
    if (error) return res.status(400).json({ error });

    error = validatePincode(pincode);
    if (error) return res.status(400).json({ error });

    error = validateCoordinates(latitudeNum, longitudeNum);
    if (error) return res.status(400).json({ error });



    

    const fullAddress =
        `${flat.trim()}, ${street.trim()}, ${city.trim()}, ${state.trim()} - ${pincode}`;




    const sql = `
        INSERT INTO schools (name, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [
            name,
            fullAddress,
            latitudeNum,
            longitudeNum
        ],
        (err, result) => {
            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Failed to add school"
                });
            }

            res.status(201).json({
                message: "School added successfully",
                schoolId: result.insertId
            });
        }
    );
});






app.get("/listSchools", (req, res) => {

    const { latitude, longitude } = req.query;

    const latitudeNum = parseFloat(latitude);
    const longitudeNum = parseFloat(longitude);

    let error;

    
    error = validateCoordinates(latitudeNum, longitudeNum);

    if (error) {
        return res.status(400).json({ error });
    }


    const sql = `
        SELECT 
            id,
            name,
            address,
            latitude,
            longitude,

            (
                6371 * ACOS(
                    COS(RADIANS(?)) *
                    COS(RADIANS(latitude)) *
                    COS(RADIANS(longitude) - RADIANS(?)) +
                    SIN(RADIANS(?)) *
                    SIN(RADIANS(latitude))
                )
            ) AS distance

        FROM schools

        ORDER BY distance ASC
    `;

    connection.query(
        sql,
        [
            latitudeNum,
            longitudeNum,
            latitudeNum
        ],
        (err, results) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Failed to fetch schools"
                });
            }

            res.status(200).json({
                message: "Schools fetched successfully",
                count: results.length,
                schools: results
            });

        }
    );

});







const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


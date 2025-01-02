const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Ashish@123",
    database: process.env.DB_NAME || "restaurant_booking",
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection error:", err);
        return;
    }
    console.log("MySQL connected!");
});

// Create Booking
app.post("/api/bookings", (req, res) => {
    const { name, contact_details, date, time, guests, table } = req.body;

    // Validate request body
    if (!name || !contact_details || !date || !time || !guests || !table) {
        return res.status(400).send({ message: "All fields are required." });
    }

    const query = `
        INSERT INTO bookings (name, contact_details, date, time, guests, \`table\`)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.query(query, [name, contact_details, date, time, guests, table], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).send({ message: "The selected time slot is already booked. Please choose another." });
            }
            return res.status(500).send({ message: "Server error" });
        }
        res.status(201).send({ message: "Booking created successfully!", bookingId: result.insertId });
    });
});

// Check Time Slot Availability
app.get("/api/availability", (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).send({ message: "Date is required" });
    }

    const allSlots = Array.from({ length: 22 }, (_, i) => {
        const hours = Math.floor(i / 2) + 12;
        const minutes = i % 2 === 0 ? "00" : "30";
        return `${hours}:${minutes}:00`;
    });

    const query = "SELECT time FROM bookings WHERE date = ?";
    db.query(query, [date], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send({ message: "Server error" });
        }

        const bookedSlots = results.map(row => row.time);
        console.log("Booked Slots:", bookedSlots); // Debug booked slots

        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        console.log("Available Slots:", availableSlots); // Debug available slots

        res.json(availableSlots);
    });
});

// Table Availability Check
app.get("/api/tables", (req, res) => {
    const { date, time } = req.query;

    if (!date || !time) {
        return res.status(400).send({ message: "Date and time are required" });
    }

    const query = `
        SELECT \`table\`
        FROM bookings
        WHERE date = ? AND time = ?;
    `;
    db.query(query, [date, time], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send({ message: "Server error" });
        }

        const bookedTables = results.map(row => row.table);
        const tables = Array.from({ length: 15 }, (_, index) =>
            bookedTables.includes(index + 1) ? "booked" : "available"
        );

        res.json(tables);
    });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

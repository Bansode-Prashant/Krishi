require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000; // you can change if needed

app.use(cors());
app.use(express.json()); // to parse JSON bodies

// 1️⃣ MySQL connection (change user, password, database if needed)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// 2️⃣ API: Get all students
app.get("/api/students", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(results);
  });
});

// 3️⃣ API: Add new student
app.post("/api/students", (req, res) => {
  const { rollNo, name, email, phone, course, year } = req.body;

  const sql = "INSERT INTO students (rollNo, name, email, phone, course, year) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [rollNo, name, email, phone, course, year], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Roll No already exists" });
      }
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json({ message: "Student record added successfully" });
  });
});

// 4️⃣ API: Update student
app.put("/api/students/:rollNo", (req, res) => {
  const rollNo = req.params.rollNo;
  const { name, email, phone, course, year } = req.body;

  const sql = `
    UPDATE students 
    SET name = ?, email = ?, phone = ?, course = ?, year = ?
    WHERE rollNo = ?
  `;
  db.query(sql, [name, email, phone, course, year, rollNo], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found for given Roll No" });
    }
    res.json({ message: "Student record updated successfully" });
  });
});

// 5️⃣ API: Delete student
app.delete("/api/students/:rollNo", (req, res) => {
  const rollNo = req.params.rollNo;

  const sql = "DELETE FROM students WHERE rollNo = ?";
  db.query(sql, [rollNo], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found for given Roll No" });
    }
    res.json({ message: "Student record deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

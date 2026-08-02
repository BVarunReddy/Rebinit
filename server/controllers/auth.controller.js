const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashed],
    );

    const token = jwt.sign(
      { id: result.insertId, name, email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .status(201)
      .json({
        token,
        user: { id: result.insertId, name, email, role: "user" },
      });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, address } = req.body;
    await pool.query(
      "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?",
      [name, phone, address, req.user.id],
    );
    const [rows] = await pool.query(
      "SELECT id, name, email, role, points, phone, address FROM users WHERE id = ?",
      [req.user.id],
    );
    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
}

module.exports = { signup, login, updateProfile };

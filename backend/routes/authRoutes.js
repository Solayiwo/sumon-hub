const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email_address, password } = req.body;

    // Basic Input Validation
    if (!first_name || !last_name || !email_address || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existing = await User.findByEmail(email_address);
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Securely hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 1. Create the user using your updated User model
    const newUser = await User.create({
        first_name,
        last_name,
        email_address,
        password_hash: hashedPassword,
    });

    // newUser is an object: { user_id: 1, first_name: 'John', ... }

    // 2. Sign the token using just the ID property
    const token = jwt.sign(
        { user_id: newUser.user_id, email: newUser.email_address },
        process.env.JWT_SECRET || "supersecret",
        { expiresIn: "7d" }
    );

    // 3. Return the clean, flat response structure
    res.status(201).json({
        token,
        user: newUser // Simply pass the clean newUser object directly here!
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email_address, password } = req.body;

    if (!email_address || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findByEmail(email_address);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare text password against stored database hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email_address },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email_address: user.email_address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

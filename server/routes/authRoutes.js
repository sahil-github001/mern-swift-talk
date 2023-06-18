const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

// Route to get profile details
router.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    // Verify the JWT token
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
      res.status(200).json(userData);
    });
  } else {
    // No token provided
    res.status(401).json({ error: "No token provided" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (!passOk) {
      return res.status(401).json({ error: "Invalid user details" });
    }
    // Generate and sign a JWT token
    jwt.sign(
      { userId: foundUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Internal Server Error jwt sign" });
        }
        // Set the token as a cookie and return the user ID
        res.cookie("token", token, { sameSite: "none", secure: true }).json({
          id: foundUser._id,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Register new User
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(401).json({ error: "User already registered" });
    }
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    await User.create({
      username: username,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// logout user
router.post("/logout", async (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});

module.exports = router;

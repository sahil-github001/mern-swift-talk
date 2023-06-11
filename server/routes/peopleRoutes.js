const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const users = await User.find({}, { _id: 1, username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

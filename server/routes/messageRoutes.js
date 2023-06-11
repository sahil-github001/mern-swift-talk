const express = require("express");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// Retrieves user data from the request's JWT token
async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        err ? reject(err) : resolve(userData);
      });
    } else {
      reject(new Error("No token provided"));
    }
  });
}

// GET messages for a specific user ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [ourUserId, userId] },
    }).sort({ created: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

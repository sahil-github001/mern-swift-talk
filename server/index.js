const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

require('dotenv').config(); 

const app  = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;

mongoose.connect(MONGO_URL);
app.listen(PORT, () => console.log(`listening to ${PORT}`));

app.get("/test", (req, res) => {
    res.json("Test works"); 
});

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    const createdUser = await User.create({username, password})
    jwt.sign({userId: createdUser._id}, jwtSecret).then((err, token) => {
        if(err) throw err;

    })// 30:54
}); 

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/User");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const dbName = process.env.DB_NAME;

// mongoose.connect(MONGO_URL);
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(PORT, () => console.log(`listening to ${PORT}`));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.get("/", (_req, res) => {
  /*
  The underscore (_) before the "req" parameter is a convention to indicate that the request object is 
  intentionally unused in this function.
  It's common to use an underscore as a variable name when the value of the variable is not needed or ignored.
  In this case, since we are not using any information from the request object, we can safely ignore 
  it by using an underscore as the variable name.
  The function still works correctly without accessing the "req" object
  */
  res.json("Test works");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

// Register new User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const createdUser = await User.create({ username, password });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
        /*
          sameSite: "none": This option sets the SameSite attribute of the cookie to "none". 
          The SameSite attribute is used to prevent cross-site request forgery (CSRF) attacks. 
          By setting it to "none", the cookie can be sent with cross-site requests, which is often 
          required for scenarios like Single Sign-On (SSO) across different domains.

          secure: true: This option sets the Secure attribute of the cookie to true. The Secure 
          attribute is used to ensure that the cookie is only sent over secure HTTPS connections. 
          By setting it to true, the cookie will only be transmitted over HTTPS, providing an 
          additional layer of security.
        */
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

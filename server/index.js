  const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Message = require("./models/Message");
const ws = require("ws");

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

app.use(express.json());
app.use(cookieParser());
const bcryptSalt = bcrypt.genSaltSync(10);

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

const getUserDataFromRequest = async (req) => {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });

}

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

app.get("/messages/:userId", async (req, res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId= userData.userId;
  const messages = await Message.find({
    sender: {$in: [userId, ourUserId]},
    recipient: {$in: [ourUserId, userId]}
  }).sort({created: 1});
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, {"_id:": 1, username: 1});
  res.json(users);
})

// Register new User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const findUser = await User.findOne({ username });
    if (findUser) {
      res.status(401).json("user already registered");
    } else {
      const createdUser = await User.create({
        username: username,
        password: hashedPassword,
      });
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
    }
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
});

const server = app.listen(PORT, () => console.log(`listening to ${PORT}`));

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  // read username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    /*
    cookies.split(";"): This line splits the cookies string into an array of individual cookie strings, 
    using the semicolon (;) as the delimiter. For example, if cookies is "token=abc123;  
    the result will be "token=abc123".

    .find((str) => str.startsWith("token=")): This line uses the find() method on the array of cookie 
    strings to find the first cookie string that starts with "token=". The startsWith() method checks 
    if a string starts with a specific substring. In this case, it checks if each cookie string 
    starts with "token=". Once the first matching cookie string is found, it is returned.

    const tokenCookieString = ...: This line assigns the found cookie string (e.g., "token=abc123") 
    to the tokenCookieString variable.
    */
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }
  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString()); 
    const {recipient, text} = messageData;
    if (recipient && text){
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) => c.send(JSON.stringify({
          text,
          sender: connection.userId,
          recipient,
          _id: messageDoc._id,
        })));
    }

  });

  // send online who are in online
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});

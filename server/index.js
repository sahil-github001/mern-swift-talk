const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Message = require("./models/Message");
const ws = require("ws");
const fs = require("fs");
const { connectToDatabase } = require("./db");
require("dotenv").config();

const app = express();
const PORT = 4000;
const jwtSecret = process.env.JWT_SECRET;

// Connect to MongoDB
connectToDatabase();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/people", require("./routes/peopleRoutes"));
app.use("/messages", require("./routes/messageRoutes"));

// Start the server
const server = app.listen(PORT, () => console.log(`listening to ${PORT}`));

// WebSocket setup
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
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
  }

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log("dead");
    }, 1000);
  }, 5000);
   
  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // Read username and Id from the cookie for this connection
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

  // Handle incoming WebSocket messages
  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;
    if (file) {
      // Save file to uploads folder
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + filename;
      const bufferData = Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        // console.log("file saved:" + path);
      });
    }
    if (recipient && (text || file)) {
      // Create a new message and notify the recipient
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      // console.log("created message");
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? filename : null,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  // send online who are in online
  notifyAboutOnlinePeople();
});

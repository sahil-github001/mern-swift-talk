const mongoose = require("mongoose");
require("dotenv").config();

const dbName = process.env.DB_NAME;
const MONGO_URL = process.env.MONGO_URL;

const connectToDatabase = async () => {
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
};

module.exports = { connectToDatabase };

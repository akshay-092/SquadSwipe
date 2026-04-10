const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect("mongodb://localhost:27017/squadswipe")
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.log("MongoDB connection failed: ", err);
    });
};

module.exports = connectDB;

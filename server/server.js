const express = require("express");
const app = express();
const connectDB = require("./utils/database");
const userRoutes = require("./routes/user.routes");
const cors = require("cors");

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api", userRoutes);
app.listen(5000, () => {
  console.log("Server running on the port : ", 5000);
});

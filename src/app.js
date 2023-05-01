const express = require("express");
const cors = require("cors");
const allRoutes = require("./routes/index.router");

const io = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
app.use("/api", allRoutes);

module.exports = app;

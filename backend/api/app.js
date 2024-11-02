const express = require("express");
require("dotenv").config();
const cors = require("cors");
const routes = require("./routes/index");

const cookieParser = require("cookie-parser");
const errorMiddeware = require("./middleware/errorMiddeware");

const app = express();
const corsOptions = {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.use(errorMiddeware);

module.exports = app;

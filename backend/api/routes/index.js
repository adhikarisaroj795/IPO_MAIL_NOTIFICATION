const express = require("express");
const app = express();
const ipoRoute = require("./ipo.route");

app.use("/api/v1/ipo/", ipoRoute);

module.exports = app;

const express = require("express");
const router = express.Router();
const ipo_ctrl = require("../controllers/ipo.controller");

router.route("/").get(ipo_ctrl.ipoListing);

module.exports = router;

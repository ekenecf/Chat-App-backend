const express = require("express");
const userController = require("../controllers/user.js");

const router = express.Router();

router.route("/").get(userController.getUsers);

module.exports = router;

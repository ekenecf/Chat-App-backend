const express = require("express");
const { check } = require('express-validator')

const authController = require('../controllers/auth')

const router = express.Router();
router.route("/signup").post(
    [
    check('userName').notEmpty().withMessage('userName is required'),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters',
    ).isLength({ min: 6 }),
  ], authController.registerUser);

  router.route("/verifyuser/:userId/:token").get(authController.verifyUser)

module.exports = router;

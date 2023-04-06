// import crypto from 'crypto'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const { createError } = require('../utils/error.js')
const sendEmail = require('../utils/email.js')
const User = require('../models/user.js')

exports.registerUser = async (req, res, next) => {
  try {
    const { email, password, confirmPassword, userName, phoneNumber } = req.body
    User.findOne({ email }, async (err, user) => {
      if (err) return res.status(400)
      if (user) {
        return next(createError(401, { Message: 'Email already in use' }))
      } else if (!user) {
        if (password !== confirmPassword)
          return next(createError(400, 'Passwords do not match'))

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        const data = {
          userName: userName,
          email: email.toLowerCase(),
          phoneNumber: phoneNumber,
          password: hash,
          confirmPassword: hash,
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return next(createError(400, { errors: errors.array() }))
        }
        const createUser = new User(data)

        const token = jwt.sign({ id: createUser._id }, process.env.JWT, {
          expiresIn: '3d',
        })

        createUser.token = token
        const verifyUser = `${req.protocol}://${req.get(
          'host',
        )}/api/users/verifyuser/${createUser._id}/${token}`

        const message = `<html>
        <head>
          <title>My Email Template</title>
        </head>
        <body>
          <h1>Hello ${createUser.userName}! 👏🏽👏🏽</h1>
          <p>Thank you for signing up on our platform.</p>
          <p>Kindly verify your email by clicking on this button
            <button>
              <a href=${verifyUser}>Verify Me!</a>
            </button> <br/>
            Or by clicking on the link below 👇🏽👇🏽<br/>
            ${verifyUser}
          </p>
        </body>
      </html>`
        sendEmail({
          email: data.email,
          subject: 'Kindly verify',
          message,
        })

        await createUser.save()
        return res.status(201).json({
          Message: 'user created successfully!',
          data: createUser,
        })
      } else {
        return next()
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.verifyUser = async (req, res, next) => {
  const { userId, token } = req.params;
  console.log(userId);
  try {
    const userToBeVerified = await User.findById(userId);
    if (!userToBeVerified) {
      throw createError(401, 'User not found');
    }
    if (userToBeVerified.token !== token) {
      throw createError(401, 'Invalid token');
    }

    userToBeVerified.verified = true;
    await userToBeVerified.save();

    res.redirect(`http://localhost:3000/users/verifyuser/${userToBeVerified._id}`);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) return next(createError(400, 'Passwords do not match'))
  try {
    const userEmail = email.toLowerCase()
    const user = await User.findOne({ email: userEmail });
    if (!user) return next(createError(404, "User not found"));
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );
        if (!isPasswordCorrect)
      return next(createError(400, "Incorrect username or password"));
    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "3d",
    });

  } catch (error) {
    next(error);
  }
};

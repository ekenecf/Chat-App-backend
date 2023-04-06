const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "A userName is required"],
    },
    email: {
      type: String,
      required: [true, "An email is required"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "A phone Number is required"],
    },
    password: {
      type: String,
      required: [true, "A password is required"],
    },
    confirmPassword: {
      type: String,
      required: [true, "A confirmation password is required"],
    },
    token: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    receivedMessages: {
      type: [String],
    },
    sentMessages: {
      type: [String]},
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;

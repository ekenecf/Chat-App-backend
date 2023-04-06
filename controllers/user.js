const User = require("../models/user.js");


exports.getUsers = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json({
      status: "success",
      numberOfUsers: user.length,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
};

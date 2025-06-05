const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //Validating all fields are provided
    if (!username || !email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        message: "Please provide all required fields (username, email, password)"
      });
    }

    //Find existing user with email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return sendResponse(res, {
        statusCode: 400,
        message: "User with this email already exists"
      });
    }
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    sendResponse(res, {
      message: "User registered successfully",
      data: { token }
    });

  } catch (err) {
    sendResponse(res, {
      statusCode: 400,
      message: "User registration failed",
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      sendResponse(res, {
        message: "User logged in successfully",
        data: { token }
      })
    } else {
      sendResponse(res, {
        statusCode: 401,
        message: "Invalid email or password"
      });
    }
  } catch (err) {
    sendResponse(res, {
      statusCode: 400,
      message: "User login failed",
      error: err.message
    })
  }
};

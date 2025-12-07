const jwt = require('jsonwebtoken');
const { createUser, checkUser } = require('./userController');
const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

 
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    const user = await createUser(username, password, { email, userType });


    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.session.user = user;
    req.session.token = token;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    const user = await checkUser(username, password);

    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );


    req.session.user = user;
    req.session.token = token;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const logout = (req, res) => {
  try {

    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during logout'
        });
      }


      res.clearCookie('token');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { signup, login, logout, getCurrentUser };
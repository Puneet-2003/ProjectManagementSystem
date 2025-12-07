const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  signup,
  login,
  logout,
  getCurrentUser
} = require('../controllers/authController');


router.get('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint',
    instructions: 'Send POST request with username and password'
  });
});


router.post('/login', login);


router.get('/signup', (req, res) => {
  res.json({
    success: true,
    message: 'Signup endpoint',
    required_fields: ['username', 'email', 'password'],
    optional_fields: ['userType (admin/client)']
  });
});


router.post('/signup', signup);


router.post('/logout', authenticate, logout);


router.get('/me', authenticate, getCurrentUser);

module.exports = router;
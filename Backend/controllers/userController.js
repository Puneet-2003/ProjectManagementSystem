const User = require('../models/User');

const createUser = async (username, password, additionalData = {}) => {
  try {
    console.log('Creating user:', { username, additionalData });
    
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (additionalData.email && !emailRegex.test(additionalData.email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const validUserTypes = ['admin', 'client'];
    if (additionalData.userType && !validUserTypes.includes(additionalData.userType)) {
      throw new Error('Invalid user type. Must be "admin" or "client"');
    }

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: additionalData.email?.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        throw new Error('Username already exists');
      }
      if (existingUser.email === additionalData.email?.toLowerCase()) {
        throw new Error('Email already registered');
      }
    }

    const user = new User({
      username: username.toLowerCase(),
      email: additionalData.email?.toLowerCase() || `${username}@example.com`,
      password: password,
      userType: additionalData.userType || 'client'
    });

    await user.save();
    
    console.log('User created successfully:', user._id);
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return userResponse;
  } catch (error) {
    console.error('Error in createUser:', error.message);
    throw error;
  }
};

const checkUser = async (username, password) => {
  try {
    console.log('Checking user:', username);
    
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = await User.findOne({ 
      username: username.toLowerCase() 
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Contact administrator.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    user.lastLogin = new Date();
    await user.save();

    console.log('User authenticated successfully:', user._id);
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return userResponse;
  } catch (error) {
    console.error('Error in checkUser:', error.message);
    throw error;
  }
};

module.exports = { createUser, checkUser };
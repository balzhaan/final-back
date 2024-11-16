const bcrypt = require('bcrypt');
const otplib = require('otplib');
const User = require('../models/user');
const { sendWelcomeEmail, sendFailedLoginNotification} = require('../utils/email-sender');
const QRCode = require('qrcode'); // Required for QR code generation

// Register User with hashed password and optional 2FA setup
exports.register = async (req, res) => {
    const { username, password, firstName, lastName, age, gender, email } = req.body;
  
    const user = await User.findOne({ username });
    if (user) return res.status(404).json({ message: 'User already exists.' });

    if(await User.findOne({email})){
        return res.status(400).json({message: 'Email already exists'});
    }
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
   
      // Create new user instance
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        age,
        gender,
        email,
        role: 'editor',
      });
      // Save user to the database
      await newUser.save();
      
      sendWelcomeEmail(email, firstName);
      return res.status(201).json({message: "Registration success"});
    } catch (error) {
      return res.status(500).json({ message: 'Registration failed.' });
    }
  };
  

// Setup 2FA (Gener`ate QR Code)
exports.setup2FA = async (req, res) => {
  
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if(user.secret){
      return res.status(409).json({message: '2FA already enabled'});
    }
    let secret = otplib.authenticator.generateSecret();

    user.secret = secret;
    await user.save();
    // Generate otpauth URL for 2FA setup
    const otpauth = otplib.authenticator.keyuri(user.username, 'PortfolioPlatform', secret);

    // Generate QR code URL from otpauth URL
    QRCode.toDataURL(otpauth, (err, qrCodeUrl) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to generate QR code.' });
      }

      // Send QR code URL to the client
      res.json({
        qrCodeUrl,
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup 2FA.' });
  }
};

// Login with username and password, and optionally OTP for 2FA
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    
    // Initialize failed login attempts if not set
    if (!req.session.failedAttempts) {
      req.session.failedAttempts = {};
    }

    const userAttempts = req.session.failedAttempts[username] || { count: 0, lastFailedLogin: null };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      userAttempts.count += 1;
      console.log(userAttempts.count);
      userAttempts.lastFailedLogin = new Date();
      req.session.failedAttempts[username] = userAttempts; // Update session

      // If the user exceeded the max attempts, notify via email
      if (userAttempts.count === 3) {
        sendFailedLoginNotification(user.email);
      }
      
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // Reset failed attempts on successful login
    req.session.failedAttempts[username] = { count: 0, lastFailedLogin: null };

    // Proceed with login
    req.session.user = {
      userId: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      role: user.role,
    };
    if(!user.secret){
      res.json({ success: "no2Fa", message: "Logged in successfully!" });
    } else{
      res.json({ success: "2Fa", message: "Logged in successfully!" });
    }
  } catch (error) {
    res.status(500).json({ success: "error", message: 'Login failed.' });
  }
};



// Verify 2FA OTP and complete login
exports.verifyOTP = async (req, res) => {
  const { token } = req.body;
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Initialize failed OTP attempts if not set
    if (!req.session.failedOTPAttempts) {
      req.session.failedOTPAttempts = {};
    }

    const userOTPAttempts = req.session.failedOTPAttempts[username] || { count: 0, lastFailedLogin: null };

    // Verify the OTP
    const isTokenValid = otplib.authenticator.verify({ token, secret: user.secret });
    if (!isTokenValid) {
      userOTPAttempts.count += 1;
      userOTPAttempts.lastFailedLogin = new Date();
      req.session.failedOTPAttempts[username] = userOTPAttempts;

      // If the user exceeded max attempts, notify via email
      if (userOTPAttempts.count === 3) {
        sendFailedLoginNotification(user.email);
      }

      return res.status(401).json({ message: 'Invalid 2FA code.' });
    }

    // Reset failed attempts on successful OTP verification
    req.session.failedOTPAttempts[username] = { count: 0, lastFailedLogin: null };

    req.session.user = {
      userId: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      role: user.role,
    };

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
};

  
exports.logout = async(req, res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to log out.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/');
    });
}

exports.skip = async (req, res) => {
  const { username } = req.params;

  try {
      // Find user by username and update the secret field to be empty
      const user = await User.findOneAndUpdate(
          { username: username },
          { $set: { secret: null } }, 
          { new: true }  
      );

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ message: '2FA setup skipped', user });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
  }
};

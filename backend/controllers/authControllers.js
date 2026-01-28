const User = require('../models/User');
const bcrypt  = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passwordEmail = require('../services/passwordEmail')
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role,phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);  
    const user = await User.create({ name, email,phone,password: hashedPassword,role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password)
    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    console.log('user.password',user.password)
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: {
        id: user._id,name: user.name,email: user.email,role: user.role},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    console.log('forgotPassword api called')
    const { email } = req.body;
    console.log('email in forgotPassword',email)
    const user = await User.findOne({ email });
    console.log('user in forgotPassword',user)
    passwordEmail.forgotPasswordEmail(email)
    if (!user || !user.email || user===null) return res.status(400).json({ message: "User not found" });
    const token = jwt.sign(
      { id: user._id, role: user.role },process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: {
        id: user._id,name: user.name,email: user.email,role: user.role},
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    console.log('resetPassword api called')
    const { email,password } = req.body;
    console.log('password in resetPassword',password)
    console.log('email in resetPassword',email)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);  
    const updatedUser = await User.updateOne({ email }, { password: hashedPassword });
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

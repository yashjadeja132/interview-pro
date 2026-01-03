const {registerUser,loginUser} = require('../controllers/authControllers')
const express = require('express')
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports=router
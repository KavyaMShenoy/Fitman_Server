const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const ValidateUserMiddleware = require('../middlewares/ValidateUserMiddleware');
const Auth = require("../middlewares/Auth");   // Authentication Middleware

// Register User
router.post('/register', ValidateUserMiddleware, UserController.registerUser);

// Login User
router.post('/login', UserController.loginUser);

// Get user profile by Id (Protected Route)
router.get("/profile/:id", Auth, UserController.getUserProfileById);

// Update user profile (Protected Route)
router.put("/profile/:id", Auth, ValidateUserMiddleware, UserController.updateUserProfile);

module.exports = router;
const express = require("express");
const userRouter = express.Router();
const db = require("../models");
const { DataTypes } = require('sequelize');
const User = require("../models/user")(db.sequelize, DataTypes);
const {authMiddleware} = require("../middleware/auth")

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



userRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        // Create the user
        const newUser = await User.create({ username, email, password: hashedPassword });

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});




userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JSON Web Token (JWT)
        const token = jwt.sign({ userId: user.id }, 'blogposts', { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token ,user});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.get('/user', authMiddleware, async (req, res) => {
    try {
      // The user ID is available in req.user.id due to the authMiddleware
      const userId = req.user.id;
  
      // Fetch the user information from the database
      const user = await User.findByPk(userId, { attributes: ['id', 'username', 'email'] });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error fetching user information:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = { userRouter }

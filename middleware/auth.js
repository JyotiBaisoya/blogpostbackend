const jwt = require('jsonwebtoken');
const db = require("../models");
const { DataTypes } = require('sequelize');
const User = require("../models/user")(db.sequelize, DataTypes);

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization'); // Assuming the token is passed in the 'Authorization' header
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token not found' });
    }
  
    try {
      const decodedToken = jwt.verify(token, 'blogposts');
  
      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      const user = await User.findOne({ where: { id: decodedToken.userId } });
  
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      // Attach the authenticated user object to the request for further use in route handlers
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: 'Invalid token' });
    }
};
  
module.exports = { authMiddleware }; 


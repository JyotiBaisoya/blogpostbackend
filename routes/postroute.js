const express = require('express');
const postRouter = express.Router();
const { authMiddleware } = require('../middleware/auth'); // Import the authentication middleware
const db = require("../models");
const { Post } = db;
const {Comment} = db;
const {User} = db;

// Create a new post
postRouter.post('/create', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        // Get the authenticated user's ID from the request
        const userId = req.user.id;

        // Create the post
        const newPost = await Post.create({ title, content, userId });

        return res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

postRouter.get('/my-posts',authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id; // Assuming the authorization middleware sets req.user
      
      const userPosts = await Post.findAll({ where: { userId } });
      return res.status(200).json(userPosts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
// Get all posts


// // Get a single post by ID
postRouter.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId, {
          include: [
              {
                  model: Comment,
                  attributes: ['id', 'text', 'createdAt'],
                  include: [
                      {
                          model: User,
                          attributes: ['username']
                      }
                  ]
              }
          ]
      });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a post by ID
postRouter.put('/:id', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content } = req.body;

        // Find the post by ID
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the owner of the post
        if (post.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the post
        post.title = title;
        post.content = content;
        await post.save();

        return res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Delete a post by ID
postRouter.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;

        // Find the post by ID
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the owner of the post
        if (post.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete the post
        await post.destroy();

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve all posts with their associated comments
postRouter.get('/', async (req, res) => {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: Comment,
            attributes: ['id', 'text', 'createdAt'], // Specify the attributes you want to retrieve for comments
            include: [
              {
                model: User,
                attributes: ['username'] // Include the username of the user who made the comment
              }
            ]
          }
        ]
      });
  
      return res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  


module.exports = postRouter;

const express = require('express');
const commentRouter = express.Router();
const { authMiddleware } = require('../middleware/auth'); // Import the authentication middleware
const db = require("../models");
const { Comment } = db;
const { Post } = db;

// Create a new comment for a post
commentRouter.post('/:postId/comments/create', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.postId;
        const { text } = req.body;

        // Find the post by ID
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Create the comment
        const newComment = await Comment.create({ text, postId, userId: req.user.id });

        return res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Update a comment by ID
commentRouter.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const { content } = req.body;

        // Find the post by ID
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the comment by ID
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the authenticated user is the owner of the comment
        if (comment.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the comment
        comment.content = content;
        await comment.save();

        return res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Delete a comment by ID
commentRouter.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;

        // Find the post by ID
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the comment by ID
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the authenticated user is the owner of the comment
        if (comment.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete the comment
        await comment.destroy();

        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Get all comments for a post
commentRouter.get('/:postId/comments', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find the post by ID
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get all comments for the post
        const comments = await Comment.findAll({ where: { postId } });

        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = { commentRouter }

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new comment
router.post('/', async (req, res) => {
  try {
    let userId = null;
    let userName = 'Anonymous';
    let isAdminComment = false;

    // Check for authentication token
    const token = req.header('x-auth-token');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        // Get user name from database
        const user = await User.findById(userId);
        userName = user.name;
        isAdminComment = user.isAdmin;
      } catch (err) {
        console.log('Invalid token, proceeding as anonymous');
      }
    }

    const comment = new Comment({
      postId: req.body.postId,
      userId: userId,
      userName: userName,
      content: req.body.content,
      isAdminComment: isAdminComment
    });

    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete comment (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
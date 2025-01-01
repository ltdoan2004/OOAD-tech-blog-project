const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  userName: { 
    type: String, 
    default: 'Unknown'
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema);

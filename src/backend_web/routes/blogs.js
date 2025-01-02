const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const slugify = require('slugify');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../public/blogs');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      // Accept only image files
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

// Create new blog post
router.post('/', [auth, adminAuth], upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, tags } = req.body;
    
    if (!title || !description || !content || !tags || !req.file) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create slug from title
    const slug = slugify(title, { lower: true, strict: true });
    
    // Create blog directory
    const blogDir = path.join(__dirname, '../../../content', slug);
    await fs.mkdir(blogDir, { recursive: true });
    
    // Create MDX file content
    const mdxContent = `---
title: "${title}"
description: "${description}"
image: "../../public/blogs/${req.file.filename}"
publishedAt: "${new Date().toISOString()}"
updatedAt: "${new Date().toISOString()}"
author: "${req.user.name}"
isPublished: true
tags:
${tags.split(',').map(tag => `- ${tag.trim()}`).join('\n')}
---

${content}`;

    // Write MDX file
    await fs.writeFile(path.join(blogDir, 'index.mdx'), mdxContent);

    res.status(201).json({
      message: 'Blog post created successfully',
      slug: slug
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    // Clean up any uploaded files if there's an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ message: error.message || 'Error creating blog post' });
  }
});

// Delete a blog post
router.delete('/:slug', [auth, adminAuth], async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Delete blog directory
    const blogDir = path.join(__dirname, '../../../content', slug);
    await fs.rm(blogDir, { recursive: true, force: true });
    
    // Find and delete associated image from public/blogs
    const publicBlogsDir = path.join(__dirname, '../../../public/blogs');
    const files = await fs.readdir(publicBlogsDir);
    
    // Find any files that contain the slug in their name
    const relatedFiles = files.filter(file => file.includes(slug));
    
    // Delete all related files
    for (const file of relatedFiles) {
      await fs.unlink(path.join(publicBlogsDir, file));
    }

    res.json({ 
      message: 'Blog post deleted successfully',
      deletedFiles: relatedFiles
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ 
      message: 'Error deleting blog post',
      error: error.message 
    });
  }
});

module.exports = router; 
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Đăng ký tài khoản User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    // Tạo user mới với isAdmin mặc định là false
    const newUser = new User({
      name,
      email,
      password,
      isAdmin: false,
    });

    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ message: "Có lỗi xảy ra." });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    const user = await User.findOne({ email });
    if (!user || password !== user.password) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Convert ObjectId to string in payload
    const tokenPayload = { 
      id: user._id.toString(), // Chuyển ObjectId thành string
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin 
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET.trim(),
      { 
        expiresIn: '24h',
        algorithm: 'HS256'
      }
    );

    // Verify token ngay sau khi tạo
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET.trim());
      console.log('Token verified after creation:', verified);
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(500).json({ message: 'Error creating secure token' });
    }

    // Convert ObjectId to string in response
    const response = {
      token,
      user: {
        id: user._id.toString(), // Chuyển ObjectId thành string
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    };

    res.json(response);

  } catch (err) {
    console.error("Login error details:", err);
    res.status(500).json({ message: "Có lỗi xảy ra khi đăng nhập" });
  }
});

// Tạo tài khoản Admin (tùy chọn)
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Creating admin with email:", email);

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new admin user
    user = new User({
      email,
      password,
      isAdmin: true
    });

    // Save the user to the database
    await user.save();
    console.log("Admin user created successfully:", user);

    res.status(201).json({ message: "Admin user created successfully" });
  } catch (err) {
    console.error("Error creating admin user:", err);
    res.status(500).json({ message: "Có lỗi xảy ra." });
  }
});

module.exports = router;

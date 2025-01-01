require("dotenv").config(); // Thêm dòng này để tải biến môi trường từ file .env

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Chỉ cho phép frontend tại localhost:3000
  methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
  credentials: true, // Nếu cần gửi cookie hoặc thông tin đăng nhập
}));
app.use(express.json());

// Kết nối MongoDB
const mongoUri = process.env.MONGO_URL; // Lấy URL từ biến môi trường
if (!mongoUri) {
  console.error("Chưa cấu hình MONGO_URL trong file .env");
  process.exit(1); // Thoát chương trình nếu thiếu MONGO_URL
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Đã kết nối MongoDB"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));

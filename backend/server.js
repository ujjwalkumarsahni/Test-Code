import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Load env variables
dotenv.config();
connectDB();

const app = express();

// ======================
// CORS Configuration (SIMPLIFIED)
// ======================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'https://cpd-frontend.onrender.com'],
  credentials: true,
  exposedHeaders: ['x-device-fingerprint', 'x-device-signals', 'Authorization'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-device-fingerprint', 
    'x-device-signals'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// ======================
// Other Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import employeeRoutes from "./routes/employeeRoutes.js";
// import studentRoutes from "./routes/studentRoutes.js";
// import schoolRoutes from "./routes/schoolRoutes.js";
// import examRoutes from "./routes/examRoutes.js";


// app.use("/api/auth",authRoutes);
// app.use("/api/admin",adminRoutes);
// app.use("/api/employee",employeeRoutes);
// app.use("/api/student",studentRoutes);
// app.use("/api/schools",schoolRoutes);
// app.use("/api/exams",examRoutes);

import schoolRoutes from "./OrderManagement/routes/schoolRoutes.js";
import authRoutes from "./OrderManagement/routes/authRoutes.js";
import ordersRoutes from "./OrderManagement/routes/orderRoutes.js";
import employeeRoutes from "./OrderManagement/routes/employeeRoutes.js";
import employeePostingRoutes from "./OrderManagement/routes/employeePostingRoutes.js";
app.use('/api/schools', schoolRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/orders', ordersRoutes);
app.use("/api/employee",employeeRoutes);
app.use('/api/employee-postings', employeePostingRoutes);

// ======================
// Health Check
// ======================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ======================
// Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ======================
// Server Start
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
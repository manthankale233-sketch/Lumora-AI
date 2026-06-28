const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const noteRoutes = require("./routes/noteRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const productivityRoutes = require("./routes/productivityRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const skincareUtilRoutes = require("./routes/skincareUtilRoutes");
const progressRoutes = require("./routes/progressRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows loading local images in the frontend
}));
app.use(morgan("dev"));

// Serve uploaded progress photos statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount payment routes before express.json() to allow raw body parsing for webhooks
app.use("/api/payments", paymentRoutes);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Lumora AI API 💜",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/productivity", productivityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/skincare-utils", skincareUtilRoutes);
app.use("/api/progress", progressRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
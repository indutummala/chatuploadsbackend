const express = require("express");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const userRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/auths");
const messageRoutes = require("./routes/messages");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Middleware for CORS
app.use(cors({ origin: "http://localhost:5000", methods: ["GET", "POST"], credentials: true }));

// Middleware for body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // Serve uploaded profile photos
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// File upload API route
app.post("/api/files/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log('File uploaded:', req.file);  // Debugging output
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ fileUrl });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.error("Error connecting to DB:", err));

// API Routes
app.use("/api/auths", authRoutes);
app.use("/api/messages", messageRoutes);
// Routes
app.use("/api/profile", userRoutes);
// Use Upload Routes
app.use("/api/upload", uploadRoutes);

// Start Server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", // Frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Global store for online users
global.onlineUsers = new Map();

// Socket.IO Configuration
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Add user to the online users map
  socket.on("add-user", (userId) => {
    if (userId) {
      global.onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} added with socket ID: ${socket.id}`);
    }
  });

  // Handle chat requests
  socket.on("chat-request", ({ from, to, message }) => {
    const recipientSocketId = global.onlineUsers.get(to);

    if (recipientSocketId) {
      console.log(`Sending chat request from ${from} to ${to}`);
      socket.to(recipientSocketId).emit("msg-recieve", {
        msg: message,
        from,
        isChatRequest: true,
      });
    } else {
      console.warn(`Recipient ${to} is not online for chat request.`);
    }

    // Save chat request to the database
    new Message({ from, to, message, isChatRequest: true })
      .save()
      .then((savedMessage) => console.log("Chat request saved:", savedMessage))
      .catch((err) => console.error("Error saving chat request:", err));
  });

  // Handle sending messages
  socket.on("send-msg", async ({ to, msg, isChatRequest }) => {
    if (!to || !msg) {
      console.error("Invalid data in send-msg event:", { to, msg });
      return;
    }

    const recipientSocketId = global.onlineUsers.get(to);
    if (recipientSocketId) {
      console.log(`Recipient ${to} is online. Emitting message.`);
      socket.to(recipientSocketId).emit("msg-recieve", { msg, from: socket.id, isChatRequest });
    } else {
      console.log(`Recipient ${to} is offline. Saving message to DB.`);
      // Save the message to DB for offline users
      try {
        await new Message({ from: socket.id, to, message: msg, isChatRequest }).save();
      } catch (error) {
        console.error("Error saving message to DB:", error);
      }
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove the disconnected user from the online users map
    for (let [userId, socketId] of global.onlineUsers.entries()) {
      if (socketId === socket.id) {
        global.onlineUsers.delete(userId);
        break;
      }
    }
  });
});

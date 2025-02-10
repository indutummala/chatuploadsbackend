const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  createUserProfile, // New function
  updateUserProfile,
  uploadProfilePhoto,
} = require("../controllers/profileController");
const multer = require("multer");

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", createUserProfile); // ✅ New route for creating a user profile
router.get("/:id", getUserProfile); // Get user profile by ID
router.put("/:id", updateUserProfile); // Update profile info
router.put("/:id/photo", upload.single("profilePhoto"), uploadProfilePhoto); // Upload profile photo

module.exports = router;

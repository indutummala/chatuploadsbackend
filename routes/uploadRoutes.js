const express = require("express");
const multer = require("multer");
const Upload = require("../models/uploadModel"); // Import model
const upload = require("../middlewares/uploadMiddleware");
const { uploadFile } = require("../controllers/uploadController");
const { uploadProfilePhoto } = require("../controllers/profileController");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// const upload = multer({ storage });
// ✅ Route to upload profile photo
router.put("/:id/photo", upload.single("profilePhoto"), uploadProfilePhoto);

// POST route to handle file upload
router.post("/upload", upload.single("file"), async (req, res) => {
    
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    // Save file details to MongoDB
    const newUpload = new Upload({
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await newUpload.save(); // Wait for database save

    res.status(201).json({ message: "File uploaded & saved!", file: newUpload });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;

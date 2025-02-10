const User = require("../models/profileModel");

async function removeNullUsernames() {
    await User.deleteMany({ username: null });
    console.log("Removed users with null usernames");
  }
  
  removeNullUsernames();
// Create new user profile
exports.createUserProfile = async (req, res) => {
  try {
    const { username, name, about, phone } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

    // Check if the username or phone number already exists
    const existingUser = await User.findOne({ $or: [{ phone }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or phone number already in use" });
    }

    const newUser = new User({ username, name, about, phone });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, about, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, about, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const profilePhoto = req.file.path; // Path of uploaded file
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePhoto },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const Upload = require("../models/uploadModel");

const uploadFile = async (req, res) => {
  try {
    console.log("Received File:", req.file); // ✅ Debugging
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newUpload = new Upload({
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await newUpload.save();
    console.log("File saved to MongoDB:", newUpload); // ✅ Debugging

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        filePath: req.file.path,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { uploadFile };

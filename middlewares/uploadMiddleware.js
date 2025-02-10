const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure upload directories exist
const createUploadFolders = () => {
  const folders = ["uploads", "uploads/images", "uploads/videos", "uploads/documents"];
  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};

// Call function to create folders
createUploadFolders();

// ✅ Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (file.mimetype.startsWith("image/")) {
      uploadPath += "images/";
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath += "videos/";
    } else {
      uploadPath += "documents/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// ✅ Allowed file types
const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "text/plain",
];

// ✅ File filter function
const fileFilter = (req, file, cb) => {
  console.log("Received file type:", file.mimetype); // Debugging

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error("❌ Rejected file type:", file.mimetype);
    cb(new Error("Invalid file type!"), false);
  }
};

// ✅ Configure Multer upload
const upload = multer({ storage, fileFilter });

module.exports = upload;

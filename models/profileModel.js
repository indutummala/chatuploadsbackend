const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  about: { type: String },
  phone: { type: String, required: true },
  profilePhoto: { type: String },
});

module.exports = mongoose.model("User", UserSchema);

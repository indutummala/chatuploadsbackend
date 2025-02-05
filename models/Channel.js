// models/Channel.js

const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
}, { timestamps: true });

module.exports = mongoose.model("Channel", ChannelSchema);

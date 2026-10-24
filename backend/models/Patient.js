const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Patient", PatientSchema);

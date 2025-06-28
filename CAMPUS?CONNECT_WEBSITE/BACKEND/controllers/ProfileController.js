const express = require("express");
const multer = require("multer");
const path = require("path");
const PersonalInformation = require("../models/PersonalInformation");

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.name) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Multer setup for storing images in 'studentphoto' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "studentphoto"); // Folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Get profile data
const getProfile = [
  isAuthenticated,
  async (req, res) => {
    const { name, email, role } = req.session;

    try {
      let profile = await PersonalInformation.findOne({ name: new RegExp(`^${name}$`, "i") });

      if (!profile) {
        profile = new PersonalInformation({ name, email, role });
        await profile.save();
      }

      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching profile" });
    }
  },
];

// Update profile data including image upload
const updateProfile = [
  isAuthenticated,
  upload.single("image"), // Handle image upload
  async (req, res) => {
    const { name, email, role } = req.session;

    try {
      const profileData = {
        ...req.body,
        name,
        email,
        role,
      };

      if (req.file) {
        profileData.imageUrl = `/studentphoto/${req.file.filename}`; // Store file path
      }

      let profile = await PersonalInformation.findOneAndUpdate(
        { name: new RegExp(`^${name}$`, "i") },
        profileData,
        { new: true, upsert: true }
      );

      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating profile" });
    }
  },
];

module.exports = { getProfile, updateProfile };

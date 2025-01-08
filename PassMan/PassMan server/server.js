require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Connect to MongoDB
const mongoURI = process.env.mongoURI;
if (!mongoURI) {
  console.error("MongoDB URI not found in environment variables.");
  process.exit(1); // Exit the process if no URI is found
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB:", error));

// Define the User model directly in the server.js file
// server.js

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Ensure username is unique
  password: { type: String, required: true }, // Store the hashed password
  faceDescriptors: { type: [Array], required: true }, // Store face descriptors as an array of floats
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;


// API for user registration
app.post("/register", async (req, res) => {
  const { username, password, faceDescriptors } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with face descriptors
    const newUser = new User({
      username,
      password: hashedPassword,
      faceDescriptors: faceDescriptors,
    });

    // Save the new user
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

// API for user login
// API for user login
app.post("/login", async (req, res) => {
    const { username, faceDescriptors } = req.body;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare the face descriptors
      const userFaceDescriptors = user.faceDescriptors;
      if (JSON.stringify(userFaceDescriptors) === JSON.stringify(faceDescriptors)) {
        // If the face descriptors match, generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ token });
      } else {
        return res.status(400).json({ message: "Face recognition failed" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

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

// Define the User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceDescriptors: { type: [Array], required: true }, // Store face descriptors as an array of floats
});

// Create the User model
const User = mongoose.model("User", userSchema);

// Helper function to calculate Euclidean distance
const calculateEuclideanDistance = (desc1, desc2) => {
  return Math.sqrt(desc1.reduce((sum, value, index) => sum + Math.pow(value - desc2[index], 2), 0));
};

// API for user registration
// API for user registration
app.post("/register", async (req, res) => {
  const { username, password, faceDescriptors } = req.body;

  try {
    // Fetch all users to check for duplicate face descriptors
    const users = await User.find();

    for (let user of users) {
      for (let storedDescriptor of user.faceDescriptors) {
        // Calculate the Euclidean distance between the input face descriptor and stored ones
        const distance = calculateEuclideanDistance(faceDescriptors[0], storedDescriptor);
        
        if (distance < 0.6) { // Threshold for facial recognition match
          return res.status(400).json({ message: "Face already registered with another user." });
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with face descriptors
    const newUser = new User({
      username,
      password: hashedPassword,
      faceDescriptors: faceDescriptors,
    });

    // Save the new user to the database
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});


// API for user login using faceDescriptors
app.post("/login", async (req, res) => {
  const { faceDescriptors } = req.body;

  try {
    const users = await User.find(); // Fetch all users
    let matchedUser = null;

    for (let user of users) {
      for (let storedDescriptor of user.faceDescriptors) {
        const distance = calculateEuclideanDistance(faceDescriptors[0], storedDescriptor);
        console.log(`Comparing with user ${user.username}. Distance: ${distance}`);

        if (distance < 0.6) {
          matchedUser = user;
          break;
        }
      }
      if (matchedUser) break; // Stop searching if a match is found
    }

    if (matchedUser) {
      const token = jwt.sign({ userId: matchedUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token, username: matchedUser.username });
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

const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const User = require("../models/User");

// @route Get api/auth
// @desc check if user is authenticated
// @access Public
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    // all good
    res.json({ success: true, message: "User authenticated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: " Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // simple validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Invalid username or password" });
  try {
    // check for existing username
    const user = await User.findOne({ username: username });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Already registered username" });
      // All Good
    }
    const harshedPassword = await argon2.hash(password);
    const newUser = new User({
      username: username,
      password: harshedPassword,
    });
    await newUser.save();

    // Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "User created successfully",
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal error" });
  }
});
//  @route POST api/auth/login
//  @desc Login a user
//  @access Public

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // simple validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid username or password" });
  }

  try {
    // Check for existing user
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "incorrect username or password" });
    }
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      return res
        .status(400)
        .json({ success: false, message: "incorrect username or password" });
    }

    // All good
    // Return token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "User login successfully",
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: " Internal Server Error" });
  }
});

module.exports = router;

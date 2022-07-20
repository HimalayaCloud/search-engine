const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

router.get("/", (req, res) => {
  res.send("User Route");
});

//  @route POST api/auth/register
//  @desc Register a user
//  @access Public

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

    res.json({success: true, message: "User created successfully",accessToken: accessToken});
  } catch (error) {}
});

module.exports = router;
